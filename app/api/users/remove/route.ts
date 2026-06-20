import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(body.id)
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  await supabaseAdmin.from('profiles').delete().eq('id', body.id)

  return NextResponse.json({ success: true })
}