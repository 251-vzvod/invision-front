'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient, apiRequest } from '@/shared/lib/api-client'
import type { ApplicationFormData } from './types'

/* ─── Application Form Submission ─── */

export interface SubmitApplicationPayload {
  program: {
    level: 'undergraduate' | 'foundation'
    faculty_id: string | null
    speciality_id: number | null
    display_label: string
  }
  personal_information: {
    first_name: string
    last_name: string
    patronymic: string
    birth_date: string
    gender: 'MALE' | 'FEMALE'
    citizenship: string
  }
  contact_information: {
    contacts: {
      phone: string
      whatsapp: string
      instagram: string
      telegram: string
    }
  }
  education: {
    english_proficiency: {
      type: 'ielts' | 'toefl'
      score: number
    }
    school_certificate: {
      type: 'unt'
      score: number
    }
  }
  motivation: {
    presentation_link: string
    motivation_letter: string
  }
}

export interface SubmitApplicationResponse {
  data: unknown
  applicant_id: string | null
}

export const prepareSubmitApplicationPayload = (
  data: ApplicationFormData,
): SubmitApplicationPayload => {
  if (!data.program) {
    throw new Error('Program is required')
  }

  if (!data.personalInformation.gender) {
    throw new Error('Gender is required')
  }

  const motivationLetter = data.motivation.motivationLetter
  if (!motivationLetter?.fileUrl) {
    throw new Error('Motivation letter file is required')
  }

  if (data.education.englishProficiency.score == null) {
    throw new Error('English proficiency score is required')
  }

  if (data.education.schoolCertificate.score == null) {
    throw new Error('School certificate score is required')
  }

  return {
    program: {
      level: data.program.level,
      faculty_id: data.program.facultyId,
      speciality_id: null,
      display_label: data.program.displayLabel,
    },
    personal_information: {
      first_name: data.personalInformation.firstName,
      last_name: data.personalInformation.lastName,
      patronymic: data.personalInformation.patronymic,
      birth_date: data.personalInformation.birthDate,
      gender: data.personalInformation.gender,
      citizenship: data.personalInformation.citizenship,
    },
    contact_information: {
      contacts: data.contactInformation.contacts,
    },
    education: {
      english_proficiency: {
        type: data.education.englishProficiency.type,
        score: data.education.englishProficiency.score,
      },
      school_certificate: {
        type: data.education.schoolCertificate.type,
        score: data.education.schoolCertificate.score,
      },
    },
    motivation: {
      presentation_link: data.motivation.presentationLink,
      motivation_letter: motivationLetter.fileUrl,
    },
  }
}

/* ─── S3 File Upload / Delete ─── */

export interface S3UploadResponse {
  url: string
  filename: string
}

export const uploadMotivationLetter = async (file: File): Promise<S3UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post<S3UploadResponse>('/api/file', formData)
}

export const deleteMotivationLetter = async (fileUrl: string): Promise<void> => {
  await apiRequest<void>('/api/file', {
    method: 'DELETE',
    body: { url: fileUrl },
  })
}

/* ─── Agent Chat ─── */

export interface AgentReplyPayload {
  text: string
  applicant_external_id: number
}

export interface AgentReplyResponse {
  message: string
  status: 'ready' | 'not_ready'
}

export const sendAgentMessage = async (
  payload: AgentReplyPayload,
): Promise<AgentReplyResponse> => {
  return apiClient.post<AgentReplyResponse>('/api/chat', payload)
}

/* ─── Mutations ─── */

export const useSubmitApplicationMutation = () =>
  useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      apiClient.post<SubmitApplicationResponse>('/api/application', payload),
  })

export const useUploadMotivationLetterMutation = () =>
  useMutation({
    mutationFn: (file: File) => uploadMotivationLetter(file),
  })

export const useDeleteMotivationLetterMutation = () =>
  useMutation({
    mutationFn: (fileUrl: string) => deleteMotivationLetter(fileUrl),
  })

export const useAgentChatMutation = () =>
  useMutation({
    mutationFn: (payload: AgentReplyPayload) => sendAgentMessage(payload),
  })
