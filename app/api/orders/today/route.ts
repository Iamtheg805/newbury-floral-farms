import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const repId = request.nextUrl.searchParams.get('rep_id')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })
  const todayStr = fmt.format(new Date())
  const startISO = `${todayStr}T00:00:00-07:00`
  const endISO = `${todayStr}T23:59:59.999-07:00`

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, truck_id, total, created_at')
    .eq('rep_id', repId)
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return NextResponse.json({ orders: [] })
  }

  const orderIds = orders.map(o => o.id)
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, flower_name, quantity, unit')
    .in('order_id', orderIds)

  const itemsByOrder: { [key: number]: { name: string; qty: number; unit: string }[] } = {}
  items?.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push({ name: it.flower_name, qty: it.quantity, unit: it.unit })
  })

  const result = orders.map(o => ({
    db_id: o.id,
    id: o.order_number,
    customer: o.customer_name,
    carrier: o.carrier,
    truck: o.truck_id,
    total: o.total,
    created_at: o.created_at,
    items: itemsByOrder[o.id] || [],
  }))

  return NextResponse.json({ orders: result })
}