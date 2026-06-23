import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('order_number', 'ORD-20415')
    .single()

  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
    data,
    error: error?.message,
  })
}