import { NextResponse } from 'next/server'
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  MANAGER_LOGIN_ENV_KEY,
  MANAGER_PASSWORD_ENV_KEY,
} from '@/shared/constants/auth'
import { createSessionToken } from '@/shared/lib/auth-session'

interface LoginBody {
  login?: string
  password?: string
}

const getManagerCredentials = (): { login: string; password: string } | null => {
  const login = process.env[MANAGER_LOGIN_ENV_KEY]
  const password = process.env[MANAGER_PASSWORD_ENV_KEY]

  if (!login || !password) {
    return null
  }

  return { login, password }
}

const getSessionSecret = (credentials: { login: string; password: string }): string =>
  `${credentials.login}:${credentials.password}`

export async function POST(request: Request) {
  const credentials = getManagerCredentials()
  if (!credentials) {
    return NextResponse.json(
      {
        message: `${MANAGER_LOGIN_ENV_KEY} and ${MANAGER_PASSWORD_ENV_KEY} must be configured`,
      },
      { status: 500 },
    )
  }

  let body: LoginBody

  try {
    body = (await request.json()) as LoginBody
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const login = body.login?.trim() ?? ''
  const password = body.password ?? ''

  if (!login || !password) {
    return NextResponse.json({ message: 'Login and password are required' }, { status: 400 })
  }

  if (login !== credentials.login || password !== credentials.password) {
    return NextResponse.json({ message: 'Invalid login or password' }, { status: 401 })
  }

  const sessionToken = await createSessionToken(getSessionSecret(credentials))

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  })

  return response
}
