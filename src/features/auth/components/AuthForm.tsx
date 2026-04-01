'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { ApiError } from '@/shared/lib/api-client'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/stores/auth-store'
import { useThemeStore } from '@/shared/stores/theme-store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { loginSchema } from '../schemas'
import { useAuthSessionQuery, useLoginMutation } from '../api'

const FALLBACK_REDIRECT = '/applicants'

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
    <div className="relative flex min-h-screen flex-col bg-white text-gray-900 transition-colors lg:flex-row dark:bg-black dark:text-white">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full border border-black/10 bg-white/80 p-0 text-gray-700 backdrop-blur hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(166,216,10,0.13)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06)_0%,transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(166,216,10,0.09)_0%,transparent_45%)]" />
      </div>

      {/* ── Left: Branding Panel ── */}
      <div className="bg-dot-grid relative flex h-48 shrink-0 items-center justify-center overflow-hidden bg-gray-950 lg:h-auto lg:w-1/2">
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(166,216,10,0.15)_0%,transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(166,216,10,0.08)_0%,transparent_50%)]" />

        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          {/* Logo */}
          <Image
            src="/logo.svg"
            alt="InVision Logo"
            width={180}
            height={180}
            className="mb-6 hidden lg:block"
            priority
          />
          <Image
            src="/logo.svg"
            alt="InVision Logo"
            width={64}
            height={64}
            className="mb-3 lg:hidden"
            priority
          />

          {/* Tagline */}
          <h1 className="mb-2 text-xl font-bold tracking-tight text-white lg:text-4xl">
            Intelligent Candidate Selection
          </h1>
          <p className="max-w-sm text-sm text-white/50 lg:text-base">
            AI-powered admissions platform for inVision U
          </p>

          {/* Floating stat badges — desktop only */}
          <div className="mt-10 hidden gap-3 lg:flex">
            <span className="-rotate-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur">
              8 Candidates Analyzed
            </span>
            <span className="rotate-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur">
              5 Merit Dimensions
            </span>
            <span className="-rotate-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur">
              Real-time AI Scoring
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 transition-colors lg:w-1/2 lg:px-12 lg:py-8 dark:bg-transparent">
        <div className="w-full max-w-md rounded-2xl border border-transparent p-0 transition-colors dark:border-white/10 dark:bg-white/[0.03] dark:p-8 dark:backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-base text-gray-500 dark:text-white/60">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="auth-login"
                className="text-sm font-medium text-gray-700 dark:text-white/80"
              >
                Login
              </Label>
              <Input
                id="auth-login"
                name="login"
                autoComplete="username"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                disabled={loginMutation.isPending}
                className={cn(
                  'h-12',
                  'dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40',
                )}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="auth-password"
                className="text-sm font-medium text-gray-700 dark:text-white/80"
              >
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
                className={cn(
                  'h-12',
                  'dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40',
                )}
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

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-gray-400 dark:text-white/50">
            InVision U &copy; 2026
          </p>
        </div>
      </div>
    </div>
  )
}
