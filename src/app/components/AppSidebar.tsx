'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Users, BarChart3, User, LogOut } from 'lucide-react'
import { useLogoutMutation } from '@/features/auth'
import { useAuthStore } from '@/shared/stores/auth-store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/shared/ui/sidebar'

const navItems = [
  {
    label: 'Applicants',
    href: '/applicants',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/applicants/analytics',
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const resetAuthStore = useAuthStore((state) => state.reset)
  const logoutMutation = useLogoutMutation()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    resetAuthStore()
    router.replace('/auth')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="InVision">
              <Link href="/applicants">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="InVision"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">InVision</span>
                  <span className="text-muted-foreground truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/applicants'
                    ? (pathname === '/applicants' || pathname.startsWith('/applicants/')) &&
                      !pathname.startsWith('/applicants/analytics')
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile">
              <User />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut />
              <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
