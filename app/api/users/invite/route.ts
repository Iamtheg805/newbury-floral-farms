import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tempPassword = 'Newbury' + Math.floor(1000 + Math.random() * 9000) + '!'

  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      role: body.role,
      full_name: body.name,
    },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userData.user.id,
    full_name: body.name,
    email: body.email.toLowerCase(),
    role: body.role,
    region: 'West',
    active: true,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, tempPassword, userId: userData.user.id })
}