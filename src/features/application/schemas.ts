import { z } from 'zod/v4'

/* ─── Helpers ─── */

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/

const dateString = z.string().regex(dateRegex, { message: 'Format: DD.MM.YYYY' })

const iinSchema = z.string().regex(/^\d{12}$/, { message: 'IIN must be exactly 12 digits' })

const phoneSchema = z
  .string()
  .min(1, { message: 'Phone is required' })
  .regex(/^\+?[\d\s\-()]+$/, { message: 'Invalid phone format' })

/* ─── Identity Document ─── */

export const identityDocumentSchema = z.object({
  type: z.enum(['passport', 'id_card']),
  number: z.string().min(1, { message: 'Document number is required' }),
  issuedBy: z.string().min(1, { message: 'Issuing authority is required' }),
  issueDate: dateString,
})

/* ─── Personal Information ─── */

export const personalInformationSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  patronymic: z.string().optional().default(''),
  birthDate: dateString,
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Please select gender',
  }),
  citizenship: z.string().min(1, { message: 'Citizenship is required' }),
  iin: iinSchema,
  document: identityDocumentSchema,
})

/* ─── Family Member ─── */

export const familyMemberSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  patronymic: z.string().optional().default(''),
  phone: phoneSchema,
})

export const familyDetailsSchema = z.object({
  father: familyMemberSchema,
  mother: familyMemberSchema,
  guardian: familyMemberSchema.nullable().optional(),
})

/* ─── Contact Information ─── */

export const addressSchema = z.object({
  country: z.string().min(1, { message: 'Country is required' }),
  region: z.string().min(1, { message: 'Region is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  street: z.string().min(1, { message: 'Street is required' }),
  house: z.string().min(1, { message: 'House is required' }),
  flat: z.string().optional().default(''),
})

export const contactsSchema = z.object({
  phone: phoneSchema,
  whatsapp: z.string().regex(/^$|^\+?[\d\s\-()]+$/, { message: 'Invalid phone format' }),
  instagram: z.string().optional().default(''),
  telegram: z.string().optional().default(''),
})

export const contactInformationSchema = z.object({
  address: addressSchema,
  contacts: contactsSchema,
})

/* ─── Combined Personal + Family for tab validation ─── */

export const personalTabSchema = z.object({
  personalInformation: personalInformationSchema,
  familyDetails: familyDetailsSchema,
})

export const contactTabSchema = z.object({
  contactInformation: contactInformationSchema,
})

export type PersonalTabFormValues = z.infer<typeof personalTabSchema>
export type ContactTabFormValues = z.infer<typeof contactTabSchema>
