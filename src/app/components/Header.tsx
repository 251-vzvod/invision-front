'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
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

const navItems = [
  { label: 'Applicants', href: '/applicants' },
  { label: 'Analytics', href: '/applicants/analytics' },
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
    <header className="border-border sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/applicants" className="flex shrink-0 items-center">
            <Image
              src="/logo.svg"
              alt="InVision"
              width={80}
              height={40}
              priority
              className="h-auto w-[80px]"
            />
          </Link>
        </div>

        {/* Center: Desktop navigation tabs */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = isNavActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-3 py-4 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
                {active && (
                  <span className="bg-primary absolute inset-x-3 -bottom-px h-0.5 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Desktop sign out */}
        <div className="hidden items-center sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="size-4" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>

        {/* Mobile: Hamburger + Sheet */}
        <div className="sm:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Image
                    src="/logo.svg"
                    alt="InVision"
                    width={80}
                    height={40}
                    className="h-auto w-[80px]"
                  />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>
              </SheetHeader>

              <nav className="mt-6 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                  const active = isNavActive(item.href, pathname)
                  return (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>

              <div className="mt-auto border-t px-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-muted-foreground hover:text-foreground w-full justify-start gap-2"
                >
                  <LogOut className="size-4" />
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
