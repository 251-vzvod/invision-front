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
    <div className="border-border bg-card sticky bottom-0 z-30 border-t px-4 py-4 sm:px-6">
      <div className="flex justify-between">
        <Button
          size="lg"
          variant="default"
          onClick={onBack}
          disabled={isFirstTab || isSubmitting}
          className="bg-primary text-foreground hover:bg-primary/90 hover:text-foreground min-w-28 rounded-xl"
        >
          Back
        </Button>

        <Button
          size="lg"
          onClick={isLastTab ? onSubmit : onNext}
          disabled={isSubmitting}
          className="bg-primary text-foreground hover:bg-primary/90 hover:text-foreground min-w-35 rounded-xl font-semibold"
        >
          {isLastTab ? (isSubmitting ? 'Sending...' : 'Send Application') : 'Next Step'}
        </Button>
      </div>
    </div>
  )
}
