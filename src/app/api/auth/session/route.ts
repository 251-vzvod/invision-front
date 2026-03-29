import { NextRequest, NextResponse } from 'next/server'
import {
  AUTH_COOKIE_NAME,
  MANAGER_LOGIN_ENV_KEY,
  MANAGER_PASSWORD_ENV_KEY,
} from '@/shared/constants/auth'
import { isValidSessionToken } from '@/shared/lib/auth-session'

const getSessionSecret = (): string | null => {
  const login = process.env[MANAGER_LOGIN_ENV_KEY]
  const password = process.env[MANAGER_PASSWORD_ENV_KEY]

  if (!login || !password) {
    return null
  }

  return `${login}:${password}`
}

export async function GET(request: NextRequest) {
  const sessionSecret = getSessionSecret()
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? ''

  if (!sessionSecret || !sessionToken) {
    return NextResponse.json({ authenticated: false })
  }

  const authenticated = await isValidSessionToken(sessionToken, sessionSecret)
  return NextResponse.json({ authenticated })
}
