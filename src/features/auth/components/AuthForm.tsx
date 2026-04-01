'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { ApiError } from '@/shared/lib/api-client'
import { useAuthStore } from '@/shared/stores/auth-store'
import { useThemeStore } from '@/shared/stores/theme-store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { loginSchema } from '../schemas'
import { useAuthSessionQuery, useLoginMutation } from '../api'

const FALLBACK_REDIRECT = '/applicants'
const SESSION_CHECK_ATTEMPTS = 4
const SESSION_CHECK_DELAY_MS = 120

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
  const { theme, toggleTheme } = useThemeStore()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTo = useMemo(() => getSafeRedirectPath(searchParams.get('next')), [searchParams])

  const { data: sessionData, refetch: refetchSession } = useAuthSessionQuery()
  const loginMutation = useLoginMutation()

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const navigateAuthenticated = (target: string) => {
    router.replace(target)
    router.refresh()

    // Hard navigation fallback for environments where client routing races cookie propagation.
    setTimeout(() => {
      if (window.location.pathname === '/auth') {
        window.location.assign(target)
      }
    }, 180)
  }

  const waitForSessionReady = async (): Promise<boolean> => {
    for (let attempt = 0; attempt < SESSION_CHECK_ATTEMPTS; attempt += 1) {
      const sessionResult = await refetchSession()
      if (sessionResult.data?.authenticated) {
        return true
      }

      await sleep(SESSION_CHECK_DELAY_MS)
    }

    return false
  }

  useEffect(() => {
    if (sessionData?.authenticated) {
      navigateAuthenticated(redirectTo)
    }
  }, [sessionData?.authenticated, redirectTo])

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

      const sessionReady = await waitForSessionReady()
      if (!sessionReady) {
        setErrorMessage('Session initialization is taking longer than expected. Please try again.')
        return
      }

      setAuthenticated(true)
      navigateAuthenticated(redirectTo)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('Invalid login or password')
        return
      }

      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred')
    }
  }

  return (
    <div className="bg-dashboard relative min-h-screen">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="border-border bg-background/80 text-muted-foreground hover:text-foreground absolute top-4 right-4 z-30 size-9 rounded-lg p-0 backdrop-blur dark:border-white/10"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border bg-card w-full rounded-xl border p-6 sm:p-8 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="mb-8">
            <div className="mb-4 flex justify-center">
              <Image src="/logo.svg" alt="InVision Logo" width={120} height={60} priority />
            </div>
            <h2 className="text-foreground text-center text-3xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2 text-center text-base">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="auth-login" className="text-foreground/90 text-sm font-medium">
                Login
              </Label>
              <Input
                id="auth-login"
                name="login"
                autoComplete="username"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                disabled={loginMutation.isPending}
                className="border-input bg-background h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-foreground/90 text-sm font-medium">
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
                className="border-input bg-background h-12"
              />
            </div>

            {errorMessage ? (
              <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-muted-foreground mt-10 text-center text-xs">InVision U &copy; 2026</p>
        </div>
      </div>
    </div>
  )
}
