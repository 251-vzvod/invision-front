'use client'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { ApplicationStatus, ApplicationViewMode, SelectedProgram } from '../types'
import { Pencil } from 'lucide-react'

interface ApplicationFormHeaderProps {
  viewMode: ApplicationViewMode
  program: SelectedProgram | null
  status: ApplicationStatus
  onOpenProgramDialog: () => void
}

export function ApplicationFormHeader({
  viewMode,
  program,
  status,
  onOpenProgramDialog,
}: ApplicationFormHeaderProps) {
  if (viewMode !== 'form') {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Internal Test</h1>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Application</h1>

        <button
          type="button"
          onClick={onOpenProgramDialog}
          className={cn(
            'hover:border-primary/30 dark:hover:border-primary/50 inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm dark:border-white/15 dark:bg-[#131c10]/90 dark:text-white/90 dark:hover:bg-[#1a2615] dark:hover:text-white',
            program
              ? 'border-border text-foreground dark:text-white/95'
              : 'border-border text-muted-foreground border-dashed dark:border-white/20 dark:text-white/70',
          )}
        >
          {program ? program.displayLabel : 'Select program...'}
          <Pencil className="text-muted-foreground size-3.5 dark:text-white/70" />
        </button>
      </div>

      <Badge variant="secondary" className="w-fit text-xs tracking-wider uppercase">
        {status}
      </Badge>
    </div>
  )
}
