'use client'

import { useCallback, useState } from 'react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useApplicationFormStore } from '../hooks/use-application-form'
import type { EnglishProficiencyType } from '../types'

const UNT_MAX_SCORE = 140

export function EducationForm() {
  const {
    data: { education },
    setEducation,
  } = useApplicationFormStore()

  // Local string states so trailing dots / partial input aren't lost on re-render
  const [englishRaw, setEnglishRaw] = useState<string>(
    education.englishProficiency.score != null ? String(education.englishProficiency.score) : '',
  )
  const [untRaw, setUntRaw] = useState<string>(
    education.schoolCertificate.score != null ? String(education.schoolCertificate.score) : '',
  )

  const handleEnglishTypeChange = useCallback(
    (type: EnglishProficiencyType) => {
      setEducation({
        englishProficiency: {
          ...education.englishProficiency,
          type,
        },
      })
    },
    [education.englishProficiency, setEducation],
  )

  const handleEnglishScoreChange = useCallback(
    (value: string) => {
      // Allow empty, digits and a single dot (e.g. "6.", "6.5")
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
      setEnglishRaw(value)
      const parsed = value === '' || value === '.' ? null : Number(value)
      setEducation({
        englishProficiency: {
          ...education.englishProficiency,
          score: parsed !== null && Number.isFinite(parsed) ? parsed : null,
        },
      })
    },
    [education.englishProficiency, setEducation],
  )

  const handleUntScoreChange = useCallback(
    (value: string) => {
      // Allow empty or digits only
      if (value !== '' && !/^\d+$/.test(value)) return
      setUntRaw(value)
      const parsed = value === '' ? null : Number(value)
      setEducation({
        schoolCertificate: {
          ...education.schoolCertificate,
          score: parsed !== null && Number.isFinite(parsed) ? parsed : null,
        },
      })
    },
    [education.schoolCertificate, setEducation],
  )

  const isIelts = education.englishProficiency.type === 'ielts'

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-base font-semibold">English proficiency results</h3>
        <p className="text-muted-foreground mb-4 text-sm">Select an exam and enter your score.</p>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">
              Exam <span className="text-destructive ml-0.5">*</span>
            </Label>

            <div className="flex gap-0">
              <button
                type="button"
                onClick={() => handleEnglishTypeChange('ielts')}
                className={cn(
                  'rounded-l-lg border px-4 py-2 text-sm font-medium transition-all',
                  isIelts
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                IELTS
              </button>
              <button
                type="button"
                onClick={() => handleEnglishTypeChange('toefl')}
                className={cn(
                  'rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium transition-all',
                  !isIelts
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                TOEFL
              </button>
            </div>
          </div>

          <FormField label={isIelts ? 'IELTS score' : 'TOEFL score'} required className="max-w-xs">
            <Input
              type="text"
              inputMode={isIelts ? 'decimal' : 'numeric'}
              placeholder={isIelts ? 'e.g. 6.5' : 'e.g. 95'}
              value={englishRaw}
              onChange={(event) => handleEnglishScoreChange(event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-2 text-base font-semibold">UNT results</h3>
        <p className="text-muted-foreground mb-4 text-sm">Enter your UNT total score.</p>

        <FormField label="UNT score" required className="max-w-xs">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={`e.g. 110 (max ${UNT_MAX_SCORE})`}
            value={untRaw}
            onChange={(event) => handleUntScoreChange(event.target.value)}
          />
        </FormField>
      </section>
    </div>
  )
}

function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}
