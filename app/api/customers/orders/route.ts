import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const customerName = request.nextUrl.searchParams.get('customer_name')
  const repId = request.nextUrl.searchParams.get('rep_id')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, total, status, created_at')
    .eq('customer_name', customerName)
    .eq('rep_id', repId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ orders: orders || [] })
}