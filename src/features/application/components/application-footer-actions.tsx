'use client'

import { Button } from '@/shared/ui/button'

interface ApplicationFooterActionsProps {
  isFirstTab: boolean
  isLastTab: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export function ApplicationFooterActions({
  isFirstTab,
  isLastTab,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}: ApplicationFooterActionsProps) {
  return (
    <div className="border-border bg-card/95 sticky bottom-0 z-30 rounded-b-xl border-t px-4 py-4 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#131c10]/90 dark:backdrop-blur-2xl">
      <div className="flex justify-between">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          disabled={isFirstTab || isSubmitting}
          className="h-12 min-w-28 rounded-xl text-base dark:border-white/15 dark:bg-white/[0.03] dark:text-white/80 dark:hover:bg-white/[0.06]"
        >
          Back
        </Button>

        <Button
          size="lg"
          onClick={isLastTab ? onSubmit : onNext}
          disabled={isSubmitting}
          className="bg-primary text-foreground hover:bg-primary/90 hover:text-foreground h-12 min-w-35 rounded-xl text-base font-semibold shadow-md"
        >
          {isLastTab ? (isSubmitting ? 'Sending...' : 'Send Application') : 'Next Step'}
        </Button>
      </div>
    </div>
  )
}
