import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/explore', '/matches', '/profile', '/dog', '/onboarding', '/documents', '/unlock']

function hasAnyAuth(request: NextRequest): boolean {
  return request.cookies.has('insforge_csrf_token') || request.cookies.has('purematch_demo')
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Protected routes accept either real or demo session
  if (isProtected && !hasAnyAuth(request)) {
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
