'use client'

import { useMemo } from 'react'
import { TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/utils'
import type { ApplicationTab } from '../types'
import { AlertTriangle, Lock } from 'lucide-react'

interface TabItem {
  value: ApplicationTab
  label: string
  disabled?: boolean
}

interface ApplicationTabsNavigationProps {
  tabs: ReadonlyArray<TabItem>
  touchedTabs: Record<ApplicationTab, boolean>
  tabValidation: Record<ApplicationTab, boolean>
}

export function ApplicationTabsNavigation({
  tabs,
  touchedTabs,
  tabValidation,
}: ApplicationTabsNavigationProps) {
  const hasWarnings = useMemo(
    () => tabs.some((tab) => touchedTabs[tab.value] && !tabValidation[tab.value]),
    [tabValidation, tabs, touchedTabs],
  )

  return (
    <div className="px-4 pb-4 sm:px-6">
      <TabsList className="bg-muted/80 flex h-auto w-full flex-wrap gap-0 rounded-xl p-1 dark:bg-white/[0.04]">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              'text-muted-foreground hover:text-foreground',
              'dark:text-white/70 dark:hover:text-white',
              'data-active:bg-card data-active:text-foreground data-active:shadow-sm dark:data-active:bg-white/10 dark:data-active:text-white',
            )}
          >
            {tab.label}
            {touchedTabs[tab.value] && !tabValidation[tab.value] && (
              <AlertTriangle className="text-destructive ml-1.5 size-3.5" />
            )}
            {tab.disabled && <Lock className="ml-1.5 size-3" />}
          </TabsTrigger>
        ))}
      </TabsList>

      {hasWarnings && (
        <p className="text-destructive mt-2 text-xs">
          Some sections contain invalid or missing required fields.
        </p>
      )}
    </div>
  )
}
