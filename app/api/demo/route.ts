import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.redirect(new URL('/explore', process.env.NEXT_PUBLIC_APP_URL ?? 'https://purematch-app.vercel.app'))
  res.cookies.set('purematch_demo', '1', {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
    sameSite: 'lax',
    httpOnly: false,
  })
  return res
}
