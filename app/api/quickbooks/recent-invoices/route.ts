import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getValidAccessToken } from '../_lib'

export async function GET() {
  const tokenInfo = await getValidAccessToken()
  if (!tokenInfo) {
    return NextResponse.json({ error: 'QuickBooks not connected or token refresh failed' })
  }

  const response = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${tokenInfo.realm_id}/query?query=${encodeURIComponent('SELECT * FROM Invoice ORDERBY MetaData.LastUpdatedTime DESC MAXRESULTS 5')}&minorversion=65`,
    { headers: { 'Authorization': `Bearer ${tokenInfo.access_token}`, 'Accept': 'application/json' } }
  )

  const result = await response.json()
  return NextResponse.json({ realm_id: tokenInfo.realm_id, result })
}