import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { order_number, stage } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_name')
    .eq('order_number', order_number)
    .single()

  if (!order) {
    return NextResponse.json({ error: `No order found with number ${order_number}` }, { status: 404 })
  }

  const update: Record<string, unknown> = { status_stage: stage }
  if (stage === 'packed') update.packed_at = new Date().toISOString()
  if (stage === 'out_for_delivery') update.shipped_at = new Date().toISOString()
  if (stage === 'delivered') update.delivered_at = new Date().toISOString()

  const { error } = await supabase.from('orders').update(update).eq('id', order.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, order_number: order.order_number, customer: order.customer_name, stage })
}