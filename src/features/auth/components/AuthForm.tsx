'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (sessionData?.authenticated) {
      router.replace(redirectTo)
    }
  }, [sessionData?.authenticated, router, redirectTo])

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(166,216,10,0.25)_0%,transparent_38%),radial-gradient(circle_at_85%_15%,rgba(193,241,29,0.2)_0%,transparent_42%),linear-gradient(180deg,#f8fafc_0%,#f3f8df_100%)] p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl items-center">
        <Card className="border-primary/25 bg-background/95 w-full shadow-xl backdrop-blur">
          <CardHeader className="space-y-3">
            <p className="border-primary/30 bg-primary/10 text-foreground inline-flex w-fit rounded-full border px-4 py-1.5 text-sm font-medium">
              Manager Access
            </p>
            <CardTitle className="text-3xl">Welcome to InVision</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Sign in to open the admission dashboard and continue reviewing applicant profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="auth-login" className="text-base font-medium">
                  Login
                </Label>
                <Input
                  id="auth-login"
                  name="login"
                  autoComplete="username"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  disabled={loginMutation.isPending}
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="auth-password" className="text-base font-medium">
                  Password
                </Label>
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

              {errorMessage ? (
                <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
                  {errorMessage}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
