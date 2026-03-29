'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLogoutMutation } from '@/features/auth'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Button } from '@/shared/ui/button'

const isHeaderHiddenRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/form')

export function GlobalHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const resetAuthStore = useAuthStore((state) => state.reset)
  const logoutMutation = useLogoutMutation()

  if (isHeaderHiddenRoute(pathname)) {
    return null
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    resetAuthStore()
    router.replace('/auth')
  }

  return (
    <header
      data-global-header="true"
      className="border-primary/20 bg-primary/5 sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/applicants" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold shadow-sm">
            IV
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold">InVision Dashboard</p>
            <p className="text-muted-foreground text-sm">Applicants and scoring overview</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Profile
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </header>
  )
}
