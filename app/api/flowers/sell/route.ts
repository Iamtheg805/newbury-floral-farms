import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: flower } = await supabase
    .from('Flowers')
    .select('current_stock')
    .eq('id', body.id)
    .single()

  if (!flower) {
    return NextResponse.json({ error: 'Flower not found' }, { status: 404 })
  }

  const newStock = Math.max(flower.current_stock - body.qty, 0)

  const { data, error } = await supabase
    .from('Flowers')
    .update({ current_stock: newStock })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, flower: data })
}