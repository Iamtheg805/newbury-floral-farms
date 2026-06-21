import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('order_number')

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, status_stage, created_at, packed_at, shipped_at, delivered_at')
    .ilike('order_number', orderNumber.trim())
    .single()

  if (!order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('flower_name, quantity, unit')
    .eq('order_id', order.id)

  return NextResponse.json({
    order_number: order.order_number,
    customer: order.customer_name,
    carrier: order.carrier,
    stage: order.status_stage || 'placed',
    placed_at: order.created_at,
    packed_at: order.packed_at,
    shipped_at: order.shipped_at,
    delivered_at: order.delivered_at,
    items: items || [],
  })
}