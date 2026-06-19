import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, carrier, total, rep_id, created_at, status')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  const profileMap: { [key: string]: string } = {}
  profiles?.forEach(p => { profileMap[p.id] = p.full_name })

  const result = (orders || []).map(o => ({
    time: new Date(o.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    rep: profileMap[o.rep_id] || 'Unknown',
    customer: o.customer_name,
    total: `$${(o.total || 0).toFixed(2)}`,
    status: o.status,
    carrier: o.carrier,
  }))

  return NextResponse.json({ orders: result })
}