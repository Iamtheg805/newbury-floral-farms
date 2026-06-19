import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: orders } = await supabase
    .from('orders')
    .select('rep_id, total, created_at')
    .gte('created_at', startOfMonth)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'rep')

  const repStats: { [key: string]: { revenue: number; orders: number } } = {}

  orders?.forEach(o => {
    if (!o.rep_id) return
    if (!repStats[o.rep_id]) repStats[o.rep_id] = { revenue: 0, orders: 0 }
    repStats[o.rep_id].revenue += o.total || 0
    repStats[o.rep_id].orders += 1
  })

  function tierFor(revenue: number) {
    if (revenue >= 40000) return 10
    if (revenue >= 20000) return 7
    return 5
  }

  const leaderboard = (profiles || []).map(p => {
    const stats = repStats[p.id] || { revenue: 0, orders: 0 }
    const rate = tierFor(stats.revenue)
    return {
      id: p.id,
      name: p.full_name,
      revenue: stats.revenue,
      orders: stats.orders,
      rate,
      commission: Math.round(stats.revenue * (rate / 100)),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const totalRevenue = leaderboard.reduce((s, r) => s + r.revenue, 0)
  const totalCommission = leaderboard.reduce((s, r) => s + r.commission, 0)

  return NextResponse.json({ leaderboard, totalRevenue, totalCommission })
}