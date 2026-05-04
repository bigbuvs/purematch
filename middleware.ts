import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/explore', '/matches', '/profile', '/dog', '/onboarding', '/documents', '/unlock']
const AUTH_ROUTES = ['/auth']

const hasRealSession = (request: NextRequest): boolean =>
  request.cookies.has('insforge_csrf_token')

const hasAnySession = (request: NextRequest): boolean =>
  request.cookies.has('insforge_csrf_token') || request.cookies.has('purematch_demo')

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Protected routes accept either real or demo session
  if (isProtected && !hasAnySession(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // /auth is only blocked by a REAL session — demo users must always be able
  // to reach /auth to upgrade to a real account
  if (isAuthRoute && hasRealSession(request)) {
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
