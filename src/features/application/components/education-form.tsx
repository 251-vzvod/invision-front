'use client'

import { useCallback } from 'react'
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
      const parsedScore = Number(value)
      setEducation({
        englishProficiency: {
          ...education.englishProficiency,
          score: Number.isFinite(parsedScore) ? parsedScore : null,
        },
      })
    },
    [education.englishProficiency, setEducation],
  )

  const handleUntScoreChange = useCallback(
    (value: string) => {
      const parsedScore = Number(value)
      setEducation({
        schoolCertificate: {
          ...education.schoolCertificate,
          score: Number.isFinite(parsedScore) ? parsedScore : null,
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
              type="number"
              min={0}
              max={isIelts ? 9 : 120}
              step={isIelts ? 0.5 : 1}
              placeholder={isIelts ? '0.0 - 9.0' : '0 - 120'}
              value={education.englishProficiency.score ?? ''}
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
            type="number"
            min={0}
            max={UNT_MAX_SCORE}
            step={1}
            placeholder={`0 - ${UNT_MAX_SCORE}`}
            value={education.schoolCertificate.score ?? ''}
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
