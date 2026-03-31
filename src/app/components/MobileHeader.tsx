'use client'

import Image from 'next/image'
import { SidebarTrigger } from '@/shared/ui/sidebar'
import { Separator } from '@/shared/ui/separator'

export function MobileHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Image src="/logo.svg" alt="InVision" width={80} height={40} className="h-auto w-[80px]" />
    </header>
  )
}
