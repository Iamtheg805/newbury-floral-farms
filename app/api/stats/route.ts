import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const repId = request.nextUrl.searchParams.get('rep_id')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: orders } = await supabase
    .from('orders')
    .select('total, created_at, customer_name')
    .eq('rep_id', repId)
    .gte('created_at', startOfMonth)

  const revenue = orders?.reduce((s, o) => s + (o.total || 0), 0) || 0
  const orderCount = orders?.length || 0
  const customers = new Set(orders?.map(o => o.customer_name)).size

  return NextResponse.json({ revenue, orderCount, customers })
}