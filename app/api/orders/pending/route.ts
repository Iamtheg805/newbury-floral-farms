import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, total, rep_id, created_at')
    .eq('invoiced', false)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return NextResponse.json({ orders: [] })
  }

  const orderIds = orders.map(o => o.id)
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, flower_name, quantity, unit, subtotal')
    .in('order_id', orderIds)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  const profileMap: { [key: string]: string } = {}
  profiles?.forEach(p => { profileMap[p.id] = p.full_name })

  const itemsByOrder: { [key: number]: { name: string; qty: number; unit: string; sub: number }[] } = {}
  items?.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push({ name: it.flower_name, qty: it.quantity, unit: it.unit, sub: it.subtotal })
  })

  const result = orders.map(o => ({
    db_id: o.id,
    order_number: o.order_number,
    customer: o.customer_name,
    carrier: o.carrier,
    total: o.total,
    rep: profileMap[o.rep_id] || 'Unknown',
    created_at: o.created_at,
    items: itemsByOrder[o.id] || [],
  }))

  return NextResponse.json({ orders: result })
}