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
    <div className="sticky bottom-0 z-30 border-t border-border bg-white px-4 py-4 sm:px-6">
      <div className="flex justify-between">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          disabled={isFirstTab || isSubmitting}
          className="h-12 min-w-28 rounded-xl text-base"
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
