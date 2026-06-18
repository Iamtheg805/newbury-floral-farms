import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')

  if (!code || !realmId) {
    return NextResponse.redirect('https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=error')
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET
  const redirectUri = 'https://newbury-floral-farms-iamtheg805s-projects.vercel.app/api/quickbooks/callback'
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  const tokens = await tokenResponse.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  await supabase.from('quickbooks_tokens').delete().neq('realm_id', '')
  
  const { error } = await supabase.from('quickbooks_tokens').insert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    realm_id: realmId,
    expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
  })

  if (error) {
    return NextResponse.redirect(`https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=dberror&msg=${error.message}`)
  }

  return NextResponse.redirect('https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=connected')
}
