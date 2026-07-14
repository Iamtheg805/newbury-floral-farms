import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getValidAccessToken } from '../../quickbooks/_lib'

function parseFlowerName(fullName: string) {
  const match = fullName.match(/^(.*)\s\((.*)\)$/)
  if (match) {
    return { name: match[1].trim(), variety: match[2].trim() }
  }
  return { name: fullName.trim(), variety: '' }
}

async function findOrCreateCustomer(accessToken: string, realmId: string, customerName: string) {
  const cleanName = customerName.trim()

  const exactResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName = '${cleanName.replace(/'/g, "\\'")}'`)}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const exactResult = await exactResponse.json()
  if (exactResult.QueryResponse?.Customer?.length > 0) {
    return exactResult.QueryResponse.Customer[0].Id
  }

  const likeResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName LIKE '${cleanName.replace(/'/g, "\\'").replace(/%/g, '\\%')}%'`)}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const likeResult = await likeResponse.json()

  if (likeResult.QueryResponse?.Customer?.length > 0) {
    const customers = likeResult.QueryResponse.Customer
    const best = customers.find((c: { DisplayName: string }) =>
      c.DisplayName.trim().toLowerCase() === cleanName.toLowerCase()
    )
    return best ? best.Id : customers[0].Id
  }

  const createResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/customer?minorversion=65`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ DisplayName: cleanName }),
    }
  )
  const createResult = await createResponse.json()
  return createResult.Customer?.Id
}

async function findOrCreateItem(accessToken: string, realmId: string, itemName: string) {
  const cleanName = itemName.trim()
  const searchResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(`SELECT * FROM Item WHERE Name = '${cleanName.replace(/'/g, "\\'")}'`)}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const searchResult = await searchResponse.json()

  if (searchResult.QueryResponse?.Item?.length > 0) {
    return searchResult.QueryResponse.Item[0].Id
  }

  const incomeAccountResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent("SELECT * FROM Account WHERE AccountType = 'Income' MAXRESULTS 1")}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const incomeAccountResult = await incomeAccountResponse.json()
  const incomeAccountId = incomeAccountResult.QueryResponse?.Account?.[0]?.Id

  if (!incomeAccountId) return null

  const createResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/item?minorversion=65`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        Name: cleanName,
        Type: 'Service',
        IncomeAccountRef: { value: incomeAccountId },
      }),
    }
  )
  const createResult = await createResponse.json()
  return createResult.Item?.Id
}

async function getNextDocNumber(accessToken: string, realmId: string) {
  const response = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent('SELECT DocNumber FROM Invoice ORDERBY MetaData.CreateTime DESC MAXRESULTS 1')}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const result = await response.json()
  const lastDoc = result.QueryResponse?.Invoice?.[0]?.DocNumber
  const lastNum = parseInt(lastDoc, 10)
  if (isNaN(lastNum)) return null
  return lastNum + 1
}

const TERMS_MAP: { [key: string]: string } = {
  'Due on Receipt': '1',
  'Net 15': '2',
  'Net 30': '3',
  'Net 60': '4',
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const orderIds: number[] = body.order_ids || []

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const tokenInfo = await getValidAccessToken()
  if (!tokenInfo) {
    return NextResponse.json({ error: 'QuickBooks not connected or token refresh failed. Please reconnect QuickBooks in Manager settings.' }, { status: 400 })
  }
  const { access_token: accessToken, realm_id: realmId } = tokenInfo

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, truck_id, total, cc_fee_amount')
    .in('id', orderIds)

  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: 'No matching orders found' }, { status: 400 })
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, flower_name, quantity, price_per_unit, subtotal, description')
    .in('order_id', orderIds)

  const { data: customersData } = await supabase
    .from('customers')
    .select('name, email, cc_email, bcc_email, payment_terms')

  const customerEmailMap: { [key: string]: { email: string; cc: string; bcc: string; payment_terms: string } } = {}
  customersData?.forEach(c => {
    customerEmailMap[c.name] = {
      email: c.email || '',
      cc: c.cc_email || '',
      bcc: c.bcc_email || '',
      payment_terms: c.payment_terms || 'Due on Receipt',
    }
  })

  const itemsByOrder: { [key: number]: { flower_name: string; quantity: number; price_per_unit: number; subtotal: number; description: string }[] } = {}
  items?.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push(it)
  })

  const itemIdCache: { [key: string]: string | null } = {}
  let ccFeeItemId: string | null | undefined = undefined

  const successIds: number[] = []
  const errors: { order: string; message: string }[] = []
  let emailsSent = 0

  let nextDocNumber = await getNextDocNumber(accessToken, realmId)

  for (const order of orders) {
    const orderItems = itemsByOrder[order.id] || []
    const customerId = await findOrCreateCustomer(accessToken, realmId, order.customer_name)

    if (!customerId) {
      errors.push({ order: order.order_number, message: 'Could not match or create customer in QuickBooks' })
      continue
    }

    const lines = []
    for (const item of orderItems) {
      const { name, variety } = parseFlowerName(item.flower_name)

      if (itemIdCache[name] === undefined) {
        itemIdCache[name] = await findOrCreateItem(accessToken, realmId, name)
      }
      const itemId = itemIdCache[name]

      if (!itemId) {
        errors.push({ order: order.order_number, message: `Could not find or create QuickBooks product for "${name}"` })
        continue
      }

      lines.push({
        Amount: item.subtotal,
        DetailType: 'SalesItemLineDetail',
        Description: item.description && item.description.trim() ? item.description.trim() : variety,
        SalesItemLineDetail: {
          ItemRef: { value: itemId, name },
          Qty: item.quantity,
          UnitPrice: item.price_per_unit,
        },
      })
    }

    if (lines.length === 0) {
      errors.push({ order: order.order_number, message: 'No valid line items could be created' })
      continue
    }

    if (order.cc_fee_amount && order.cc_fee_amount > 0) {
      if (ccFeeItemId === undefined) {
        ccFeeItemId = await findOrCreateItem(accessToken, realmId, '2.99% FEE Credit Card')
      }
      if (ccFeeItemId) {
        lines.push({
          Amount: order.cc_fee_amount,
          DetailType: 'SalesItemLineDetail',
          Description: 'Credit card processing fee',
          SalesItemLineDetail: {
            ItemRef: { value: ccFeeItemId, name: '2.99% FEE Credit Card' },
            Qty: 1,
            UnitPrice: order.cc_fee_amount,
          },
        })
      }
    }

    const contact = customerEmailMap[order.customer_name]
    const termsId = TERMS_MAP[contact?.payment_terms || 'Due on Receipt'] || '1'

    const invoice: Record<string, unknown> = {
      Line: lines,
      CustomerRef: { value: customerId },
      SalesTermRef: { value: termsId },
      PrivateNote: `Carrier: ${order.carrier} | Truck: ${order.truck_id} | Order: ${order.order_number}`,
    }

    if (nextDocNumber !== null) invoice.DocNumber = String(nextDocNumber)
    if (contact?.email) invoice.BillEmail = { Address: contact.email }
    if (contact?.cc) invoice.BillEmailCc = { Address: contact.cc }
    if (contact?.bcc) invoice.BillEmailBcc = { Address: contact.bcc }

    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice?minorversion=65`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(invoice),
      }
    )

    const result = await response.json()
    if (!response.ok || result.Fault) {
      errors.push({ order: order.order_number, message: result.Fault ? JSON.stringify(result.Fault) : `HTTP ${response.status}: ${JSON.stringify(result)}` })
      continue
    }

    successIds.push(order.id)
    if (nextDocNumber !== null) nextDocNumber += 1

    if (contact?.email) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      try {
        const sendResponse = await fetch(
          `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice/${result.Invoice.Id}/send?minorversion=65`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
          }
        )
        if (sendResponse.ok) emailsSent++
      } catch (e) {
        console.log('Could not auto-send invoice email:', e)
      }
    }
  }

  if (successIds.length > 0) {
    await supabase.from('orders').update({ invoiced: true }).in('id', successIds)
  }

  return NextResponse.json({ success: true, invoiced: successIds.length, emailsSent, errors })
}