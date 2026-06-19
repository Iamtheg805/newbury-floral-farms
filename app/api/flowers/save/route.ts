import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const record = {
    name: body.name,
    variety: body.variety,
    color: body.color || '#999999',
    unit: body.unit || 'bunch',
    stems_per_unit: body.stems_per_unit || 10,
    morning_qty: body.morning_qty,
    current_stock: body.current_stock !== undefined ? body.current_stock : body.morning_qty,
    price: body.price,
    active: body.active !== undefined ? body.active : true,
  }

  if (body.id) {
    const { data, error } = await supabase
      .from('Flowers')
      .update(record)
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, flower: data })
  } else {
    const { data, error } = await supabase
      .from('Flowers')
      .insert(record)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, flower: data })
  }
}