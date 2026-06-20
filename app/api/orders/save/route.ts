import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_number: body.order_number,
      customer_name: body.customer_name,
      carrier: body.carrier,
      truck_id: body.truck_id,
      total: body.total,
      cc_fee_amount: body.cc_fee_amount || 0,
      rep_id: body.rep_id || null,
      status: 'finalized',
      finalized_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (order && body.items) {
    await supabase.from('order_items').insert(
      body.items.map((item: { name: string; qty: number; price: number; sub: number; unit: string }) => ({
        order_id: order.id,
        flower_name: item.name,
        quantity: item.qty,
        unit: item.unit,
        price_per_unit: item.price,
        subtotal: item.sub,
      }))
    )
  }

  return NextResponse.json({ success: true, order_id: order?.id })
}