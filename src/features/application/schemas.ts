import { z } from "zod/v4";

/* ─── Helpers ─── */

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

const dateString = z
  .string()
  .regex(dateRegex, { message: "Format: DD.MM.YYYY" });

const iinSchema = z
  .string()
  .regex(/^\d{12}$/, { message: "IIN must be exactly 12 digits" });

const phoneSchema = z
  .string()
  .min(1, { message: "Phone is required" })
  .regex(/^\+?[\d\s\-()]+$/, { message: "Invalid phone format" });

/* ─── Identity Document ─── */

export const identityDocumentSchema = z.object({
  type: z.enum(["passport", "id_card"]),
  number: z.string().min(1, { message: "Document number is required" }),
  issuedBy: z.string().min(1, { message: "Issuing authority is required" }),
  issueDate: dateString,
});

/* ─── Personal Information ─── */

export const personalInformationSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  patronymic: z.string().optional().default(""),
  birthDate: dateString,
  gender: z.enum(["MALE", "FEMALE"], {
    message: "Please select gender",
  }),
  citizenship: z.string().min(1, { message: "Citizenship is required" }),
  iin: iinSchema,
  document: identityDocumentSchema,
});

/* ─── Family Member ─── */

export const familyMemberSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  patronymic: z.string().optional().default(""),
  phone: phoneSchema,
});

export const familyDetailsSchema = z.object({
  father: familyMemberSchema,
  mother: familyMemberSchema,
  guardian: familyMemberSchema.nullable().optional(),
});

/* ─── Combined Personal + Family for tab validation ─── */

export const personalTabSchema = z.object({
  personalInformation: personalInformationSchema,
  familyDetails: familyDetailsSchema,
});

export type PersonalTabFormValues = z.infer<typeof personalTabSchema>;
