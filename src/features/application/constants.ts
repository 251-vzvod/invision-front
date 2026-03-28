import type {
  Faculty,
  ApplicationFormData,
  PersonalInformation,
  FamilyDetails,
  ContactInformation,
  Education,
  Agreements,
  MotivationData,
  FamilyMember,
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
    id: 'art-media',
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
    id: 'policy-reform',
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

const emptyFamilyMember: FamilyMember = {
  firstName: '',
  lastName: '',
  patronymic: '',
  phone: '',
}

export const EMPTY_PERSONAL_INFO: PersonalInformation = {
  firstName: '',
  lastName: '',
  patronymic: '',
  birthDate: '',
  gender: null,
  citizenship: 'Kazakhstan',
  iin: '',
  document: {
    type: 'passport',
    number: '',
    issuedBy: '',
    issueDate: '',
  },
}

export const EMPTY_FAMILY_DETAILS: FamilyDetails = {
  father: { ...emptyFamilyMember },
  mother: { ...emptyFamilyMember },
  guardian: null,
}

export const EMPTY_CONTACT_INFO: ContactInformation = {
  address: {
    country: 'Kazakhstan',
    region: '',
    city: '',
    street: '',
    house: '',
    flat: '',
  },
  contacts: {
    phone: '',
    whatsapp: '',
    instagram: '',
    telegram: '',
  },
}

export const EMPTY_EDUCATION: Education = {
  videoPresentationLink: '',
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
  motivationQuestions: {},
}

export const EMPTY_AGREEMENTS: Agreements = {
  personalDataConsent: false,
  underageParentConsent: false,
}

export const INITIAL_FORM_DATA: ApplicationFormData = {
  program: null,
  status: 'draft',
  personalInformation: EMPTY_PERSONAL_INFO,
  familyDetails: EMPTY_FAMILY_DETAILS,
  contactInformation: EMPTY_CONTACT_INFO,
  education: EMPTY_EDUCATION,
  motivation: EMPTY_MOTIVATION,
  agreements: EMPTY_AGREEMENTS,
}

/* ─── Citizenship options ─── */

export const CITIZENSHIP_OPTIONS = [
  'Kazakhstan',
  'Russia',
  'Uzbekistan',
  'Kyrgyzstan',
  'Tajikistan',
  'Turkmenistan',
  'Other',
] as const

/* ─── Motivation ─── */

export const MOTIVATION_FILE_ACCEPT = '.doc,.docx,.pdf,.txt'

export const MOTIVATION_ALLOWED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'text/plain',
] as const

export const MOTIVATION_ALLOWED_EXTENSIONS = ['doc', 'docx', 'pdf', 'txt'] as const

export const MOTIVATION_QUESTIONS = [
  {
    id: 'q1',
    prompt:
      'Tell us about the most difficult period in your life - what happened, how did you cope, and what changed in you afterwards?',
  },
  {
    id: 'q2',
    prompt:
      'What habits or daily routines have you deliberately built for yourself, and how do they impact your results? Why did you choose specifically those?',
  },
  {
    id: 'q3',
    prompt:
      'Was there a time when you worked toward a goal for a long time but never reached it? What did you take away from that experience?',
  },
  {
    id: 'q4',
    prompt:
      'Describe a project, idea, or solution you came up with entirely on your own initiative - not as an assignment. Where did the idea come from, and what was the outcome?',
  },
  {
    id: 'q5',
    prompt:
      'How do you usually make important decisions - do you rely on intuition, data, or advice from others? Walk us through a specific real example from your life.',
  },
  {
    id: 'q6',
    prompt:
      'Have you ever faced a situation where you had to choose between what was efficient and what was right? What did you do, and why?',
  },
  {
    id: 'q7',
    prompt:
      'Is there a problem in your city, country, or the world that genuinely troubles you? Why that one specifically - and what do you think is its root cause?',
  },
  {
    id: 'q8',
    prompt:
      'How has your worldview shifted over the last 2-3 years? What drove that change - a book, a person, an event, an experience?',
  },
  {
    id: 'q9',
    prompt:
      'What do you think Kazakhstan will look like in 20 years - and what role do you believe your generation will play in shaping it?',
  },
  {
    id: 'q10',
    prompt:
      'Recall a moment when you took a stance or did something that was unpopular among the people around you. What drove you to do it?',
  },
  {
    id: 'q11',
    prompt:
      'Tell us about a person or community you helped - not because you had to, but because you genuinely wanted to. What did that experience give you?',
  },
  {
    id: 'q12',
    prompt:
      'What are your three core values - and can you give one real example from your life for each, showing how it actually showed up in what you did?',
  },
  {
    id: 'q13',
    prompt:
      'Have you ever organized, launched, or promoted something - an event, an initiative, a small business, a club? What worked, what did not, and what would you do differently?',
  },
  {
    id: 'q14',
    prompt:
      'How have you earned money or created something of value before applying to university? Walk us through the idea, the process, and the result.',
  },
  {
    id: 'q15',
    prompt:
      'If you were given $1,000 and one month to do something meaningful - not necessarily to make a profit, but to create real value - what would you do and why?',
  },
] as const
