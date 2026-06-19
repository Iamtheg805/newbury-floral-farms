import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const repId = request.nextUrl.searchParams.get('rep_id')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (repId) {
    query = query.eq('rep_id', repId)
  }

  const { data: customers, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ customers: customers || [] })
}