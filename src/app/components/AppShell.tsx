'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from './AppSidebar'
import { MobileHeader } from './MobileHeader'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { useSidebarStore } from '@/shared/stores/sidebar-store'

const isSidebarHiddenRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/form')

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen, setOpen } = useSidebarStore()

  if (isSidebarHiddenRoute(pathname)) {
    return <>{children}</>
  }

  return (
    <SidebarProvider open={isOpen} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
