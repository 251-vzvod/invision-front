'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApiError } from '@/shared/lib/api-client'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { loginSchema } from '../schemas'
import { useAuthSessionQuery, useLoginMutation } from '../api'

const FALLBACK_REDIRECT = '/'

const getSafeRedirectPath = (value: string | null): string => {
  if (!value) {
    return FALLBACK_REDIRECT
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return FALLBACK_REDIRECT
  }

  return value
}

export function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTo = useMemo(() => getSafeRedirectPath(searchParams.get('next')), [searchParams])

  const { data: sessionData } = useAuthSessionQuery()
  const loginMutation = useLoginMutation()

  if (sessionData?.authenticated) {
    router.replace(redirectTo)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsed = loginSchema.safeParse({ login, password })
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid credentials format')
      return
    }

    try {
      await loginMutation.mutateAsync(parsed.data)
      setAuthenticated(true)
      router.replace(redirectTo)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('Invalid login or password')
        return
      }

      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manager authentication</CardTitle>
          <CardDescription>Sign in to open the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-login">Login</Label>
              <Input
                id="auth-login"
                name="login"
                autoComplete="username"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loginMutation.isPending}
              />
            </div>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
