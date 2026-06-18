import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=error&msg=${error}`)
  }

  if (!code || !realmId) {
    return NextResponse.redirect('https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=nocode')
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
  const tokenStr = JSON.stringify(tokens).substring(0, 100)

  return NextResponse.redirect(`https://newbury-floral-farms-iamtheg805s-projects.vercel.app/manager?qb=debug&tokens=${encodeURIComponent(tokenStr)}&realm=${realmId}`)
}
