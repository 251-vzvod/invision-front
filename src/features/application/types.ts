/* ─── Program types ─── */

export type ProgramLevel = 'undergraduate' | 'foundation'

export interface Faculty {
  id: string
  name: string
  specialities: Speciality[]
}

export interface Speciality {
  id: string
  name: string
}

export interface SelectedProgram {
  level: ProgramLevel
  /** null for foundation year */
  facultyId: string | null
  /** null for foundation year */
  specialityId: string | null
  /** Display label, e.g. "Undergraduate | Digital Media and Marketing" */
  displayLabel: string
}

/* ─── Personal Information ─── */

export type Gender = 'MALE' | 'FEMALE'

export interface PersonalInformation {
  firstName: string
  lastName: string
  patronymic: string
  birthDate: string // DD.MM.YYYY
  gender: Gender | null
  citizenship: string
}

/* ─── Contact Information ─── */

export interface Contacts {
  phone: string
  whatsapp: string
  instagram: string
  telegram: string
}

export interface ContactInformation {
  contacts: Contacts
}

/* ─── Education ─── */

export type EnglishProficiencyType = 'ielts' | 'toefl'
export type SchoolCertificateType = 'unt'

export interface Education {
  englishProficiency: {
    type: EnglishProficiencyType
    score: number | null
  }
  schoolCertificate: {
    type: SchoolCertificateType
    score: number | null
  }
}

/* ─── Motivation ─── */

export interface SerializedMotivationLetter {
  fileUrl: string
  fileName: string
  mimeType: string
  size: number
}

export interface MotivationData {
  motivationLetter: SerializedMotivationLetter | null
  presentationLink: string
}

/* ─── Agreements ─── */

export interface Agreements {
  personalDataConsent: boolean
  underageParentConsent: boolean
}

/* ─── Full Application ─── */

export type ApplicationStatus = 'draft' | 'submitted'

export interface ApplicationFormData {
  program: SelectedProgram | null
  status: ApplicationStatus
  personalInformation: PersonalInformation
  contactInformation: ContactInformation
  education: Education
  motivation: MotivationData
  agreements: Agreements
}

export type ApplicationTab = 'personal' | 'contact' | 'education' | 'motivation'

/* ─── Chat (Agent) ─── */

export interface ChatMessage {
  sender: 'agent' | 'user'
  text: string
}

export type ApplicationViewMode = 'form' | 'testIntro' | 'testChat' | 'testFinished'
