import type {
  Faculty,
  ApplicationFormData,
  PersonalInformation,
  ContactInformation,
  Education,
  Agreements,
  MotivationData,
} from './types'

/* ─── Education Programs ─── */

export const FACULTIES: Faculty[] = [
  {
    id: 'society',
    name: 'Society',
    specialities: [
      {
        id: 'sociology-leadership',
        name: 'Sociology: Leadership and Innovation',
      },
    ],
  },
  {
    id: 'art_media',
    name: 'Art + Media',
    specialities: [
      {
        id: 'digital-media-marketing',
        name: 'Digital Media and Marketing',
      },
    ],
  },
  {
    id: 'tech',
    name: 'Tech',
    specialities: [
      {
        id: 'it-product-design',
        name: 'Innovative IT Product Design and Development',
      },
    ],
  },
  {
    id: 'policy_reform',
    name: 'Policy Reform',
    specialities: [
      {
        id: 'public-policy',
        name: 'Public Policy and Development',
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    specialities: [
      {
        id: 'creative-engineering',
        name: 'Creative Engineering',
      },
    ],
  },
]

/* ─── Empty defaults ─── */

export const EMPTY_PERSONAL_INFO: PersonalInformation = {
  firstName: '',
  lastName: '',
  patronymic: '',
  birthDate: '',
  gender: null,
  citizenship: 'Kazakhstan',
}

export const EMPTY_CONTACT_INFO: ContactInformation = {
  contacts: {
    phone: '',
    whatsapp: '',
    instagram: '',
    telegram: '',
  },
}

export const EMPTY_EDUCATION: Education = {
  englishProficiency: {
    type: 'ielts',
    score: null,
  },
  schoolCertificate: {
    type: 'unt',
    score: null,
  },
}

export const EMPTY_MOTIVATION: MotivationData = {
  motivationLetter: null,
  presentationLink: '',
}

export const EMPTY_AGREEMENTS: Agreements = {
  personalDataConsent: false,
  underageParentConsent: false,
}

export const INITIAL_FORM_DATA: ApplicationFormData = {
  program: null,
  status: 'draft',
  personalInformation: EMPTY_PERSONAL_INFO,
  contactInformation: EMPTY_CONTACT_INFO,
  education: EMPTY_EDUCATION,
  motivation: EMPTY_MOTIVATION,
  agreements: EMPTY_AGREEMENTS,
}

/* ─── Citizenship options ─── */

export const CITIZENSHIP_OPTIONS = ['Kazakhstan'] as const

/* ─── Motivation ─── */

export const MOTIVATION_FILE_ACCEPT = '.doc,.docx,.pdf,.txt'

export const MOTIVATION_ALLOWED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'text/plain',
] as const

export const MOTIVATION_ALLOWED_EXTENSIONS = ['doc', 'docx', 'pdf', 'txt'] as const
