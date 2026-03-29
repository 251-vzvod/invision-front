import { NextRequest, NextResponse } from 'next/server'
import {
  AUTH_COOKIE_NAME,
  MANAGER_LOGIN_ENV_KEY,
  MANAGER_PASSWORD_ENV_KEY,
} from '@/shared/constants/auth'
import { isValidSessionToken } from '@/shared/lib/auth-session'

const AUTH_PATH = '/auth'
const DEFAULT_AUTHENTICATED_REDIRECT = '/applicants'

const isProtectedPath = (pathname: string): boolean => pathname.startsWith('/applicants')

const getSessionSecret = (): string | null => {
  const login = process.env[MANAGER_LOGIN_ENV_KEY]
  const password = process.env[MANAGER_PASSWORD_ENV_KEY]

  if (!login || !password) {
    return null
  }

  return `${login}:${password}`
}

const getSafeNextPath = (value: string | null): string => {
  if (!value) {
    return DEFAULT_AUTHENTICATED_REDIRECT
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_AUTHENTICATED_REDIRECT
  }

  return value
}

export async function proxy(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname

  if (!isProtectedPath(pathname) && pathname !== AUTH_PATH) {
    return NextResponse.next()
  }

  const sessionSecret = getSessionSecret()
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? ''
  const isAuthenticated =
    sessionSecret !== null && Boolean(token)
      ? await isValidSessionToken(token, sessionSecret)
      : false

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const redirectUrl = new URL(AUTH_PATH, request.url)
    const fullPath = `${pathname}${nextUrl.search}`
    redirectUrl.searchParams.set('next', fullPath)

    return NextResponse.redirect(redirectUrl)
  }

  if (pathname === AUTH_PATH && isAuthenticated) {
    const redirectTarget = getSafeNextPath(nextUrl.searchParams.get('next'))
    return NextResponse.redirect(new URL(redirectTarget, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth', '/applicants/:path*'],
}
