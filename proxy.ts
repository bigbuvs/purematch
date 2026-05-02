import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/explore', '/matches', '/profile', '/dog', '/onboarding', '/documents', '/unlock']
const AUTH_ROUTES = ['/auth']

function hasSession(request: NextRequest): boolean {
  return request.cookies.has('insforge_csrf_token')
}

function hasAnyAuth(request: NextRequest): boolean {
  return request.cookies.has('insforge_csrf_token') || request.cookies.has('purematch_demo')
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Protected pages need any auth (real session or demo)
  if (isProtected && !hasAnyAuth(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Auth page: only redirect away if there's a REAL session (not demo)
  // Demo users must be able to reach /auth to log in
  if (isAuthRoute && hasSession(request)) {
    const next = request.nextUrl.searchParams.get('next')
    const url = request.nextUrl.clone()
    url.pathname = next && next.startsWith('/') ? next : '/explore'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
