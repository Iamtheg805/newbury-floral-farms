import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: qbTokens } = await supabase
    .from('quickbooks_tokens')
    .select('*')
    .single()

  if (!qbTokens) {
    return NextResponse.json({ error: 'No tokens found' })
  }

  const response = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${qbTokens.realm_id}/companyinfo/${qbTokens.realm_id}`,
    {
      headers: {
        'Authorization': `Bearer ${qbTokens.access_token}`,
        'Accept': 'application/json',
      },
    }
  )

  const result = await response.json()
  return NextResponse.json({ realm_id: qbTokens.realm_id, result })
}
