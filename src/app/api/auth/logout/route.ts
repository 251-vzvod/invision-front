import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/shared/constants/auth'

const shouldUseSecureCookie = (request: Request): boolean => {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.toLowerCase()

  if (forwardedProto) {
    return forwardedProto.includes('https')
  }

  const protocol = new URL(request.url).protocol
  return protocol === 'https:'
}

export async function POST(request: Request) {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookie(request),
    path: '/',
    maxAge: 0,
  })

  return response
}
