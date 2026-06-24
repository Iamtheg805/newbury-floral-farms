import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  if (host.startsWith('track.') && !pathname.startsWith('/api/') && pathname !== '/track') {
    const url = request.nextUrl.clone()
    url.pathname = '/track'
    return NextResponse.rewrite(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
