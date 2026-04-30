import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/explore', '/matches', '/profile', '/dog', '/onboarding', '/documents', '/unlock']
const AUTH_ROUTES = ['/auth']

function hasAuthCookie(request: NextRequest): boolean {
  // InsForge SDK sets insforge_csrf_token cookie when user is authenticated
  return request.cookies.has('insforge_csrf_token')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = hasAuthCookie(request)

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthenticated) {
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
