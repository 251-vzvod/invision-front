'use client'

import { useCallback } from 'react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useApplicationFormStore } from '../hooks/use-application-form'
import { CITIZENSHIP_OPTIONS } from '../constants'

export function ContactInformationForm() {
  const {
    data: { contactInformation },
    setContactInformation,
  } = useApplicationFormStore()

  const handleAddressChange = useCallback(
    (field: keyof typeof contactInformation.address, value: string) => {
      setContactInformation({
        address: {
          ...contactInformation.address,
          [field]: value,
        },
      })
    },
    [contactInformation.address, setContactInformation],
  )

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
        <h3 className="mb-4 text-base font-semibold">Home Address</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Country" required>
            <Select
              value={contactInformation.address.country}
              onValueChange={(value) => handleAddressChange('country', value)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {CITIZENSHIP_OPTIONS.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Region" required>
            <Input
              placeholder="Enter region"
              value={contactInformation.address.region}
              onChange={(e) => handleAddressChange('region', e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="City" required>
            <Input
              placeholder="Enter city"
              value={contactInformation.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </FormField>

          <FormField label="Street" required className="lg:col-span-2">
            <Input
              placeholder="Enter street"
              value={contactInformation.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
            />
          </FormField>

          <FormField label="House" required>
            <Input
              placeholder="No."
              value={contactInformation.address.house}
              onChange={(e) => handleAddressChange('house', e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Apartment">
            <Input
              placeholder="Apartment / Flat"
              value={contactInformation.address.flat}
              onChange={(e) => handleAddressChange('flat', e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Contact Details</h3>

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
