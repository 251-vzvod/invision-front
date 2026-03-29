'use client'

import { useCallback } from 'react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { useApplicationFormStore } from '../hooks/use-application-form'
import { CITIZENSHIP_OPTIONS } from '../constants'
import type { Gender } from '../types'

export function PersonalInformationForm() {
  const {
    data: { personalInformation: info },
    setPersonalInformation,
  } = useApplicationFormStore()

  const handlePersonalChange = useCallback(
    (field: keyof typeof info, value: string) => {
      setPersonalInformation({ [field]: value })
    },
    [setPersonalInformation],
  )

  const handleGenderSelect = useCallback(
    (gender: Gender) => {
      setPersonalInformation({ gender })
    },
    [setPersonalInformation],
  )

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-base font-semibold">Applicant details</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Last Name" required>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={info.lastName}
              onChange={(e) => handlePersonalChange('lastName', e.target.value)}
            />
          </FormField>

          <FormField label="First Name" required>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={info.firstName}
              onChange={(e) => handlePersonalChange('firstName', e.target.value)}
            />
          </FormField>

          <FormField label="Patronymic">
            <Input
              id="patronymic"
              placeholder="Enter patronymic"
              value={info.patronymic}
              onChange={(e) => handlePersonalChange('patronymic', e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Date of Birth" required>
            <Input
              id="birthDate"
              placeholder="DD.MM.YYYY"
              value={info.birthDate}
              onChange={(e) => handlePersonalChange('birthDate', e.target.value)}
              maxLength={10}
            />
          </FormField>

          <FormField label="Citizenship" required>
            <Select
              value={info.citizenship}
              onValueChange={(value) => handlePersonalChange('citizenship', value)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select citizenship" />
              </SelectTrigger>
              <SelectContent>
                {CITIZENSHIP_OPTIONS.map((citizenship) => (
                  <SelectItem key={citizenship} value={citizenship}>
                    {citizenship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="mt-4">
          <Label className="mb-2">
            Gender <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-0">
            <button
              type="button"
              onClick={() => handleGenderSelect('MALE')}
              className={cn(
                'rounded-l-lg border px-4 py-2 text-sm font-medium transition-all',
                info.gender === 'MALE'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect('FEMALE')}
              className={cn(
                'rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium transition-all',
                info.gender === 'FEMALE'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              Female
            </button>
          </div>
        </div>
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
