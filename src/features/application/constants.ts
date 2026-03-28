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
} from "./types";

/* ─── Education Programs ─── */

export const FACULTIES: Faculty[] = [
  {
    id: "society",
    name: "Society",
    specialities: [
      {
        id: "sociology-leadership",
        name: "Sociology: Leadership and Innovation",
      },
    ],
  },
  {
    id: "art-media",
    name: "Art + Media",
    specialities: [
      {
        id: "digital-media-marketing",
        name: "Digital Media and Marketing",
      },
    ],
  },
  {
    id: "tech",
    name: "Tech",
    specialities: [
      {
        id: "it-product-design",
        name: "Innovative IT Product Design and Development",
      },
    ],
  },
  {
    id: "policy-reform",
    name: "Policy Reform",
    specialities: [
      {
        id: "public-policy",
        name: "Public Policy and Development",
      },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    specialities: [
      {
        id: "creative-engineering",
        name: "Creative Engineering",
      },
    ],
  },
];

/* ─── Empty defaults ─── */

const emptyFamilyMember: FamilyMember = {
  firstName: "",
  lastName: "",
  patronymic: "",
  phone: "",
};

export const EMPTY_PERSONAL_INFO: PersonalInformation = {
  firstName: "",
  lastName: "",
  patronymic: "",
  birthDate: "",
  gender: null,
  citizenship: "Kazakhstan",
  iin: "",
  document: {
    type: "passport",
    number: "",
    issuedBy: "",
    issueDate: "",
  },
};

export const EMPTY_FAMILY_DETAILS: FamilyDetails = {
  father: { ...emptyFamilyMember },
  mother: { ...emptyFamilyMember },
  guardian: null,
};

export const EMPTY_CONTACT_INFO: ContactInformation = {
  address: {
    country: "Kazakhstan",
    region: "",
    city: "",
    street: "",
    house: "",
    flat: "",
  },
  contacts: {
    phone: "",
    whatsapp: "",
    instagram: "",
    telegram: "",
  },
};

export const EMPTY_EDUCATION: Education = {
  videoPresentationLink: "",
  englishProficiency: {
    type: "ielts",
    score: null,
  },
  schoolCertificate: {
    type: "unt",
    score: null,
  },
};

export const EMPTY_MOTIVATION: MotivationData = {
  motivationLetter: null,
  motivationQuestions: {},
};

export const EMPTY_AGREEMENTS: Agreements = {
  personalDataConsent: false,
  underageParentConsent: false,
};

export const INITIAL_FORM_DATA: ApplicationFormData = {
  program: null,
  status: "draft",
  personalInformation: EMPTY_PERSONAL_INFO,
  familyDetails: EMPTY_FAMILY_DETAILS,
  contactInformation: EMPTY_CONTACT_INFO,
  education: EMPTY_EDUCATION,
  motivation: EMPTY_MOTIVATION,
  agreements: EMPTY_AGREEMENTS,
};

/* ─── Citizenship options ─── */

export const CITIZENSHIP_OPTIONS = [
  "Kazakhstan",
  "Russia",
  "Uzbekistan",
  "Kyrgyzstan",
  "Tajikistan",
  "Turkmenistan",
  "Other",
] as const;
