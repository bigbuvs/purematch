import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/explore', request.url))
  res.cookies.set('purematch_demo', '1', {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    httpOnly: false,
  })
  return res
}
