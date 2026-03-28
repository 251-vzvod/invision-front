/* ─── Program types ─── */

export type ProgramLevel = "undergraduate" | "foundation";

export interface Faculty {
  id: string;
  name: string;
  specialities: Speciality[];
}

export interface Speciality {
  id: string;
  name: string;
}

export interface SelectedProgram {
  level: ProgramLevel;
  /** null for foundation year */
  facultyId: string | null;
  /** null for foundation year */
  specialityId: string | null;
  /** Display label, e.g. "Undergraduate | Digital Media and Marketing" */
  displayLabel: string;
}

/* ─── Personal Information ─── */

export type Gender = "MALE" | "FEMALE";
export type DocumentType = "passport" | "id_card";

export interface IdentityDocument {
  type: DocumentType;
  number: string;
  issuedBy: string;
  issueDate: string; // DD.MM.YYYY
}

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  patronymic: string;
  birthDate: string; // DD.MM.YYYY
  gender: Gender | null;
  citizenship: string;
  iin: string;
  document: IdentityDocument;
}

/* ─── Family Details (part of Personal Info tab) ─── */

export interface FamilyMember {
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
}

export interface FamilyDetails {
  father: FamilyMember;
  mother: FamilyMember;
  guardian: FamilyMember | null;
}

/* ─── Contact Information ─── */

export interface Address {
  country: string;
  region: string;
  city: string;
  street: string;
  house: string;
  flat: string;
}

export interface Contacts {
  phone: string;
  whatsapp: string;
  instagram: string;
  telegram: string;
}

export interface ContactInformation {
  address: Address;
  contacts: Contacts;
}

/* ─── Education ─── */

export type EnglishProficiencyType = "ielts" | "toefl";
export type SchoolCertificateType = "unt";

export interface Education {
  videoPresentationLink: string;
  englishProficiency: {
    type: EnglishProficiencyType;
    score: number | null;
  };
  schoolCertificate: {
    type: SchoolCertificateType;
    score: number | null;
  };
}

/* ─── Motivation ─── */

export interface MotivationData {
  motivationLetter: File | null;
  motivationQuestions: Record<string, string>;
}

/* ─── Agreements ─── */

export interface Agreements {
  personalDataConsent: boolean;
  underageParentConsent: boolean;
}

/* ─── Full Application ─── */

export type ApplicationStatus = "draft" | "submitted";

export interface ApplicationFormData {
  program: SelectedProgram | null;
  status: ApplicationStatus;
  personalInformation: PersonalInformation;
  familyDetails: FamilyDetails;
  contactInformation: ContactInformation;
  education: Education;
  motivation: MotivationData;
  agreements: Agreements;
}

export type ApplicationTab =
  | "personal"
  | "contact"
  | "education"
  | "motivation";
