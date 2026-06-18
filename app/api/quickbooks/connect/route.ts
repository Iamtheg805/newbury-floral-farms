import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const redirectUri = 'https://newbury-floral-farms-iamtheg805s-projects.vercel.app/api/quickbooks/callback'
  const scope = 'com.intuit.quickbooks.accounting'
  const state = Math.random().toString(36).substring(7)
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`
  return NextResponse.redirect(authUrl)
}
