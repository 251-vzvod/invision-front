'use client'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { ApplicationStatus, SelectedProgram } from '../types'
import { Pencil } from 'lucide-react'

interface ApplicationFormHeaderProps {
  program: SelectedProgram | null
  status: ApplicationStatus
  onOpenProgramDialog: () => void
}

export function ApplicationFormHeader({
  program,
  status,
  onOpenProgramDialog,
}: ApplicationFormHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Application</h1>

        <button
          type="button"
          onClick={onOpenProgramDialog}
          className={cn(
            'hover:border-primary/50 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm',
            program
              ? 'border-primary/30 bg-accent-1 text-foreground'
              : 'border-border bg-background text-muted-foreground border-dashed',
          )}
        >
          {program ? program.displayLabel : 'Select program...'}
          <Pencil className="text-muted-foreground size-3.5" />
        </button>
      </div>

      <Badge variant="secondary" className="w-fit text-xs tracking-wider uppercase">
        {status}
      </Badge>
    </div>
  )
}
