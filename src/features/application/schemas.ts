import { z } from 'zod/v4'
import { MOTIVATION_ALLOWED_MIME_TYPES, MOTIVATION_ALLOWED_EXTENSIONS } from './constants'

/* ─── Helpers ─── */

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/

const dateString = z.string().regex(dateRegex, { message: 'Format: DD.MM.YYYY' })

const phoneSchema = z
  .string()
  .min(1, { message: 'Phone is required' })
  .regex(/^\+?[\d\s\-()]+$/, { message: 'Invalid phone format' })

const isYouTubeLink = (value: string): boolean => {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com'
  } catch {
    return false
  }
}

/* ─── Personal Information ─── */

export const personalInformationSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  patronymic: z.string().optional().default(''),
  birthDate: dateString,
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Please select gender',
  }),
  citizenship: z.literal('Kazakhstan', {
    error: 'Only Kazakhstan citizenship is allowed',
  }),
})

/* ─── Contact Information ─── */

export const contactsSchema = z.object({
  phone: phoneSchema,
  whatsapp: z.string().regex(/^$|^\+?[\d\s\-()]+$/, { message: 'Invalid phone format' }),
  instagram: z.string().optional().default(''),
  telegram: z.string().optional().default(''),
})

export const contactInformationSchema = z.object({
  contacts: contactsSchema,
})

/* ─── Combined Personal + Family for tab validation ─── */

export const personalTabSchema = z.object({
  personalInformation: personalInformationSchema,
})

export const contactTabSchema = z.object({
  contactInformation: contactInformationSchema,
})

/* ─── Education ─── */

export const educationSchema = z.object({
  englishProficiency: z
    .object({
      type: z.enum(['ielts', 'toefl']),
      score: z.number({ error: 'English score is required' }).nonnegative(),
    })
    .superRefine((value, ctx) => {
      if (value.type === 'ielts' && value.score > 9) {
        ctx.addIssue({
          code: 'custom',
          message: 'IELTS score must be between 0 and 9',
          path: ['score'],
        })
      }

      if (value.type === 'toefl' && value.score > 120) {
        ctx.addIssue({
          code: 'custom',
          message: 'TOEFL score must be between 0 and 120',
          path: ['score'],
        })
      }
    }),
  schoolCertificate: z.object({
    type: z.literal('unt'),
    score: z
      .number({ error: 'UNT score is required' })
      .int({ message: 'UNT score must be an integer' })
      .min(0, { message: 'UNT score cannot be negative' })
      .max(140, { message: 'UNT score must be between 0 and 140' }),
  }),
})

export const educationTabSchema = z.object({
  education: educationSchema,
})

/* ─── Motivation ─── */

const hasAllowedLetterExtension = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension) {
    return false
  }

  return MOTIVATION_ALLOWED_EXTENSIONS.includes(
    extension as (typeof MOTIVATION_ALLOWED_EXTENSIONS)[number],
  )
}

const motivationLetterSchema = z
  .object({
    fileUrl: z.string().url({ message: 'Uploaded file URL is required' }),
    fileName: z.string().min(1, { message: 'File name is required' }),
    mimeType: z.string().min(1, { message: 'MIME type is required' }),
    size: z.number().int().positive(),
  })
  .superRefine((value, ctx) => {
    const hasAllowedMime = MOTIVATION_ALLOWED_MIME_TYPES.includes(
      value.mimeType as (typeof MOTIVATION_ALLOWED_MIME_TYPES)[number],
    )
    const hasAllowedExtension = hasAllowedLetterExtension(value.fileName)

    if (!hasAllowedMime && !hasAllowedExtension) {
      ctx.addIssue({
        code: 'custom',
        message: 'Only DOC, DOCX, PDF, and TXT files are allowed',
        path: ['fileName'],
      })
    }
  })

export const motivationSchema = z.object({
  presentationLink: z
    .string()
    .url({ message: 'Enter a valid URL' })
    .refine(isYouTubeLink, { message: 'Presentation link must be a YouTube URL' }),
  motivationLetter: motivationLetterSchema,
})

export const motivationTabSchema = z.object({
  motivation: motivationSchema,
})

/* ─── Full Application Submit ─── */

export const agreementsSchema = z.object({
  personalDataConsent: z.literal(true, {
    error: 'Personal data consent is required',
  }),
  underageParentConsent: z.literal(true, {
    error: 'Age and guardian confirmation is required',
  }),
})

export const applicationSubmitSchema = z.object({
  program: z.object({
    level: z.enum(['undergraduate', 'foundation']),
    facultyId: z.string().nullable(),
    specialityId: z.string().nullable(),
    displayLabel: z.string().min(1, { message: 'Program is required' }),
  }),
  personalInformation: personalInformationSchema,
  contactInformation: contactInformationSchema,
  education: educationSchema,
  motivation: motivationSchema,
  agreements: agreementsSchema,
})

export type PersonalTabFormValues = z.infer<typeof personalTabSchema>
export type ContactTabFormValues = z.infer<typeof contactTabSchema>
export type EducationTabFormValues = z.infer<typeof educationTabSchema>
export type MotivationTabFormValues = z.infer<typeof motivationTabSchema>
