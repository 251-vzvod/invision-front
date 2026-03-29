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
    <div className="border-border bg-card/95 border-b px-4 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-sm sm:px-6">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 py-5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'border-border/70 text-foreground/80 hover:bg-muted hover:text-foreground h-9 rounded-lg border px-4 text-sm font-medium transition-colors',
              'data-active:border-primary data-active:bg-primary data-active:text-foreground',
            )}
          >
            {tab.label}
            {touchedTabs[tab.value] && !tabValidation[tab.value] && (
              <AlertTriangle className="text-destructive size-3.5" />
            )}
            {tab.disabled && <Lock className="size-3" />}
          </TabsTrigger>
        ))}
      </TabsList>

      {hasWarnings && (
        <p className="text-destructive pb-3 text-xs">
          Some sections contain invalid or missing required fields.
        </p>
      )}
    </div>
  )
}
