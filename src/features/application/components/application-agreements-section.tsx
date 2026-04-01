'use client'

import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'
import type { Agreements } from '../types'
import { AlertTriangle } from 'lucide-react'

interface ApplicationAgreementsSectionProps {
  agreements: Agreements
  onChange: (agreements: Partial<Agreements>) => void
  submissionError: string | null
}

export function ApplicationAgreementsSection({
  agreements,
  onChange,
  submissionError,
}: ApplicationAgreementsSectionProps) {
  return (
    <div className="border-border border-t px-4 py-5 sm:px-6 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="personal-data-consent"
            checked={agreements.personalDataConsent}
            onCheckedChange={(checked) => onChange({ personalDataConsent: checked === true })}
            className="mt-1"
          />
          <Label htmlFor="personal-data-consent" className="text-sm leading-5 dark:text-white/85">
            By submitting this form, you agree to the processing of your personal data in accordance
            with our Privacy Policy <span className="text-destructive">*</span>
          </Label>
        </div>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="underage-parent-consent"
            checked={agreements.underageParentConsent}
            onCheckedChange={(checked) => onChange({ underageParentConsent: checked === true })}
            className="mt-1"
          />
          <Label htmlFor="underage-parent-consent" className="text-sm leading-5 dark:text-white/85">
            If the participant is under the age of 18, this questionnaire must be completed by their
            parent or legal guardian. By proceeding, you confirm that you are either (a) the
            participant aged 18 or older, or (b) the parent or legal guardian completing this form
            on behalf of a minor.
            <span className="text-destructive"> *</span>
          </Label>
        </div>
      </div>

      {submissionError && (
        <div
          className={cn(
            'mt-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
            'border-destructive/20 bg-destructive/5 text-destructive',
          )}
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}
    </div>
  )
}
