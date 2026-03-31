'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, LogOut, Menu, User, Users, X } from 'lucide-react'
import { useLogoutMutation } from '@/features/auth'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Applicants', href: '/applicants', icon: Users },
  { label: 'Analytics', href: '/applicants/analytics', icon: BarChart3 },
]

const isHeaderHiddenRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/form')

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/applicants') {
    return (
      (pathname === '/applicants' || pathname.startsWith('/applicants/')) &&
      !pathname.startsWith('/applicants/analytics')
    )
  }
  return pathname.startsWith(href)
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const resetAuthStore = useAuthStore((state) => state.reset)
  const logoutMutation = useLogoutMutation()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isHeaderHiddenRoute(pathname)) {
    return null
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    resetAuthStore()
    router.replace('/auth')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-950/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Left: Logo + divider + app name */}
        <div className="flex items-center gap-3">
          <Link href="/applicants" className="flex shrink-0 items-center">
            <Image
              src="/logo.svg"
              alt="InVision"
              width={90}
              height={45}
              priority
              className="h-auto w-[110px]"
            />
          </Link>
        </div>

        {/* Center: Desktop navigation pill tabs */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = isNavActive(item.href, pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2 text-base font-medium transition-all',
                  active
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-white/50 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="size-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Avatar / sign out (desktop) */}
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="h-9 w-9 rounded-full bg-primary/15 p-0 text-primary hover:bg-primary/25 hover:text-primary"
            title="Sign out"
          >
            {logoutMutation.isPending ? (
              <span className="text-xs font-bold animate-pulse">...</span>
            ) : (
              <User className="size-[18px]" />
            )}
          </Button>
        </div>

        {/* Mobile: Hamburger + Sheet */}
        <div className="sm:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="size-9 rounded-lg border-white/20 p-0 text-white/70 hover:text-white"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-white/10 bg-gray-950">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Image
                    src="/logo.svg"
                    alt="InVision"
                    width={90}
                    height={45}
                    className="h-auto w-[90px]"
                  />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>
              </SheetHeader>

              <nav className="mt-6 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                  const active = isNavActive(item.href, pathname)
                  const Icon = item.icon
                  return (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-lg font-medium transition-colors',
                          active
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-white/50 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        <Icon className="size-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>

              <div className="mt-auto border-t border-white/10 px-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-white/50 hover:text-white w-full justify-start gap-2.5 py-3.5 text-lg"
                >
                  <LogOut className="size-5" />
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom accent: gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent" />
    </header>
  )
}
