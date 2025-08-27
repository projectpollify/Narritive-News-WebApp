import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect admin routes
export function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    // TODO: Implement proper authentication check here
    // For now, we'll just add a warning header
    const response = NextResponse.next()
    response.headers.set('X-Warning', 'Authentication not yet implemented')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
