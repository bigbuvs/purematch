import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes accessible with demo cookie OR real session
const DEMO_OK = ['/explore', '/matches', '/profile', '/dog']
// Routes that require a real authenticated session (not demo)
const REAL_ONLY = ['/onboarding', '/documents', '/edit-profile', '/unlock', '/admin']

function hasAnyAuth(request: NextRequest): boolean {
  return request.cookies.has('insforge_csrf_token') || request.cookies.has('purematch_demo')
}

function hasRealAuth(request: NextRequest): boolean {
  return request.cookies.has('insforge_csrf_token')
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDemoOk   = DEMO_OK.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isRealOnly = REAL_ONLY.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isDemoOk && !hasAnyAuth(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isRealOnly && !hasRealAuth(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // /auth is always accessible — the page itself shows a "switch account"
  // UI when the user already has an active session. Never auto-redirect away.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'  ],
}
