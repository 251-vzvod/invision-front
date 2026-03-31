'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLogoutMutation } from '@/features/auth'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Button } from '@/shared/ui/button'
import Image from 'next/image'

const isHeaderHiddenRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/form')

export function Header() {
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
      className="border-border sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/applicants" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="InVision Logo"
              width={100}
              height={50}
              priority
              className="h-auto w-[100px]"
            />
            <div className="hidden md:block">
              <p className="text-foreground text-lg font-semibold">InVision Dashboard</p>
              <p className="text-muted-foreground text-sm">Applicants and scoring overview</p>
            </div>
          </Link>
          <Link
            href="/applicants/analytics"
            className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:block"
          >
            Analytics
          </Link>
        </div>

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
