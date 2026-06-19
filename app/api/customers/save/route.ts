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
    email: body.email || '',
    phone: body.phone || '',
    adress: body.adress || '',
    city: body.city || '',
    state: body.state || '',
    zip: body.zip || '',
    rep_id: body.rep_id || null,
    status: body.status || 'active',
    notes: body.notes || '',
  }

  if (body.id) {
    const { data, error } = await supabase
      .from('customers')
      .update(record)
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, customer: data })
  } else {
    const { data, error } = await supabase
      .from('customers')
      .insert(record)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, customer: data })
  }
}