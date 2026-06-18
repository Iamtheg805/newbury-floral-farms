import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  for (const order of orders) {
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
      CustomerRef: { value: '1' },
      DocNumber: order.id,
      PrivateNote: `Sales rep: Jake Rivera | Carrier: ${order.carrier} | Truck: ${order.truck}`,
    }

    const response = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${qbTokens.realm_id}/invoice`,
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
    results.push(result)
  }

  return NextResponse.json({ success: true, invoices: results.length })
}
