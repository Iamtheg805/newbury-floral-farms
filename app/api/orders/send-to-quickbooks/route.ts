import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function findOrCreateCustomer(accessToken: string, realmId: string, customerName: string) {
  const searchResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Customer WHERE DisplayName = '${customerName.replace(/'/g, "\\'")}'&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
  )
  const searchResult = await searchResponse.json()

  if (searchResult.QueryResponse?.Customer?.length > 0) {
    return searchResult.QueryResponse.Customer[0].Id
  }

  const createResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/customer?minorversion=65`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ DisplayName: customerName }),
    }
  )
  const createResult = await createResponse.json()
  return createResult.Customer?.Id || '1'
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const orderIds: number[] = body.order_ids || []

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: qbTokens } = await supabase.from('quickbooks_tokens').select('*').single()
  if (!qbTokens) {
    return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 })
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, truck_id, total')
    .in('id', orderIds)

  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: 'No matching orders found' }, { status: 400 })
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, flower_name, quantity, price_per_unit, subtotal')
    .in('order_id', orderIds)

  const itemsByOrder: { [key: number]: { flower_name: string; quantity: number; price_per_unit: number; subtotal: number }[] } = {}
  items?.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push(it)
  })

  const successIds: number[] = []
  const errors: { order: string; message: string }[] = []

  for (const order of orders) {
    const orderItems = itemsByOrder[order.id] || []
    const customerId = await findOrCreateCustomer(qbTokens.access_token, qbTokens.realm_id, order.customer_name)

    const invoice = {
      Line: orderItems.map(item => ({
        Amount: item.subtotal,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1', name: item.flower_name },
          Qty: item.quantity,
          UnitPrice: item.price_per_unit,
        },
      })),
      CustomerRef: { value: customerId },
      PrivateNote: `Carrier: ${order.carrier} | Truck: ${order.truck_id} | Order: ${order.order_number}`,
    }

    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${qbTokens.realm_id}/invoice?minorversion=65`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${qbTokens.access_token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(invoice),
      }
    )

    const result = await response.json()
    if (result.Fault) {
      errors.push({ order: order.order_number, message: JSON.stringify(result.Fault) })
    } else {
      successIds.push(order.id)
    }
  }

  if (successIds.length > 0) {
    await supabase.from('orders').update({ invoiced: true }).in('id', successIds)
  }

  return NextResponse.json({ success: true, invoiced: successIds.length, errors })
}