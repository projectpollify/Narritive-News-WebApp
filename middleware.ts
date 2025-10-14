import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protect admin routes with authentication
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication check for login page and auth API
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Check if it's an admin route that needs protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Get the user's token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If no token, redirect to login
    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Check if user has admin or editor role for admin routes
    if (token.role !== 'ADMIN' && token.role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // User is authenticated and authorized
    const response = NextResponse.next()
    response.headers.set('X-User-Role', token.role as string)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
