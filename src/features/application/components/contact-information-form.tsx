'use client'

import { useCallback } from 'react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'
import { useApplicationFormStore } from '../hooks/use-application-form'

export function ContactInformationForm() {
  const {
    data: { contactInformation },
    setContactInformation,
  } = useApplicationFormStore()

  const handleContactsChange = useCallback(
    (field: keyof typeof contactInformation.contacts, value: string) => {
      setContactInformation({
        contacts: {
          ...contactInformation.contacts,
          [field]: value,
        },
      })
    },
    [contactInformation.contacts, setContactInformation],
  )

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-base font-semibold">Contact details</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Mobile phone number" required>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={contactInformation.contacts.phone}
              onChange={(e) => {
                const normalizedValue = e.target.value.replace(/[^\d+\s\-()]/g, '')
                handleContactsChange('phone', normalizedValue)
              }}
            />
          </FormField>

          <FormField label="WhatsApp">
            <Input
              placeholder="+7 (___) ___-__-__"
              value={contactInformation.contacts.whatsapp}
              onChange={(e) => {
                const normalizedValue = e.target.value.replace(/[^\d+\s\-()]/g, '')
                handleContactsChange('whatsapp', normalizedValue)
              }}
            />
          </FormField>

          <FormField label="Instagram">
            <Input
              placeholder="@username"
              value={contactInformation.contacts.instagram}
              onChange={(e) => handleContactsChange('instagram', e.target.value)}
            />
          </FormField>

          <FormField label="Telegram">
            <Input
              placeholder="@username"
              value={contactInformation.contacts.telegram}
              onChange={(e) => handleContactsChange('telegram', e.target.value)}
            />
          </FormField>
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
