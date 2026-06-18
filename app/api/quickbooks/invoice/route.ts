import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function findOrCreateCustomer(accessToken: string, realmId: string, customerName: string, phone: string) {
  const searchResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Customer WHERE DisplayName = '${customerName}'&minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }
  )
  const searchResult = await searchResponse.json()
  
  if (searchResult.QueryResponse?.Customer?.length > 0) {
    return searchResult.QueryResponse.Customer[0].Id
  }

  const createResponse = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/customer?minorversion=65`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        DisplayName: customerName,
        PrimaryPhone: { FreeFormNumber: phone },
      }),
    }
  )
  const createResult = await createResponse.json()
  return createResult.Customer?.Id || '1'
}

export async function POST(request: NextRequest) {
  const { orders } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: qbTokens } = await supabase
    .from('quickbooks_tokens')
    .select('*')
    .single()

  if (!qbTokens) {
    return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 })
  }

  const results = []
  const errors = []

  for (const order of orders) {
    const customerId = await findOrCreateCustomer(
      qbTokens.access_token,
      qbTokens.realm_id,
      order.customer,
      order.phone
    )

    const invoice = {
      Line: order.items.map((item: { name: string; qty: number; price: number; sub: number }) => ({
        Amount: item.sub,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1', name: item.name },
          Qty: item.qty,
          UnitPrice: item.price,
        },
      })),
      CustomerRef: { value: customerId },
      PrivateNote: `Carrier: ${order.carrier} | Truck: ${order.truck}`,
    }

    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${qbTokens.realm_id}/invoice?minorversion=65`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${qbTokens.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(invoice),
      }
    )

    const result = await response.json()
    if (result.Fault) {
      errors.push(result.Fault)
    } else {
      results.push(result)
    }
  }

  return NextResponse.json({ success: true, invoices: results.length, errors })
}
