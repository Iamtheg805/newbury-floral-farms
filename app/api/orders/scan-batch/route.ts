import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const orderNumbers: string[] = body.order_numbers || []
  const stage: string = body.stage

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const update: Record<string, unknown> = { status_stage: stage }
  if (stage === 'packed') update.packed_at = new Date().toISOString()
  if (stage === 'out_for_delivery') update.shipped_at = new Date().toISOString()
  if (stage === 'delivered') update.delivered_at = new Date().toISOString()

  const results: { order_number: string; success: boolean; customer?: string; message: string }[] = []

  for (const orderNumber of orderNumbers) {
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, customer_name')
      .eq('order_number', orderNumber)
      .single()

    if (!order) {
      results.push({ order_number: orderNumber, success: false, message: 'Order not found' })
      continue
    }

    const { error } = await supabase.from('orders').update(update).eq('id', order.id)

    if (error) {
      results.push({ order_number: orderNumber, success: false, message: error.message })
    } else {
      results.push({ order_number: orderNumber, success: true, customer: order.customer_name, message: 'Updated' })
    }
  }

  return NextResponse.json({ success: true, results })
}