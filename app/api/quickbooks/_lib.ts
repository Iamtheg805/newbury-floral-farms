import { createClient } from '@supabase/supabase-js'

export async function getValidAccessToken() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: tokens } = await supabase.from('quickbooks_tokens').select('*').single()
  if (!tokens) return null

  const expiresAt = new Date(tokens.expires_at).getTime()
  const now = Date.now()
  const isExpired = now >= expiresAt - 60000

  if (!isExpired) {
    return { access_token: tokens.access_token, realm_id: tokens.realm_id }
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const refreshResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  })

  const newTokens = await refreshResponse.json()

  if (!newTokens.access_token) {
    return null
  }

  await supabase
    .from('quickbooks_tokens')
    .update({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: new Date(Date.now() + (newTokens.expires_in || 3600) * 1000).toISOString(),
    })
    .eq('realm_id', tokens.realm_id)

  return { access_token: newTokens.access_token, realm_id: tokens.realm_id }
}