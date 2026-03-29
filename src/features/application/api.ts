'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient, apiRequest } from '@/shared/lib/api-client'
import type { ApplicationFormData, ChatRequestPayload, ChatResponsePayload } from './types'

export interface SubmitApplicationPayload {
  program: {
    level: 'undergraduate' | 'foundation'
    faculty_id: string | null
    speciality_id: string | null
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
    contacts: ApplicationFormData['contactInformation']['contacts']
  }
  education: {
    english_proficiency: ApplicationFormData['education']['englishProficiency']
    school_certificate: ApplicationFormData['education']['schoolCertificate']
  }
  motivation: {
    presentation_link: string
    motivation_letter: string
  }
}

export interface SubmitApplicationResponse {
  id: string
  user_id: string
  status: 'draft' | 'submitted'
  message?: string
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

  return {
    program: {
      level: data.program.level,
      faculty_id: data.program.facultyId,
      speciality_id: data.program.specialityId,
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
      english_proficiency: data.education.englishProficiency,
      school_certificate: data.education.schoolCertificate,
    },
    motivation: {
      presentation_link: data.motivation.presentationLink,
      motivation_letter: motivationLetter.fileUrl,
    },
  }
}

export interface UploadFileResponse {
  file_url: string
}

export interface DeleteFilePayload {
  file_url: string
}

export const uploadMotivationLetter = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post<UploadFileResponse>('/api/file', formData)
}

export const deleteMotivationLetter = async (fileUrl: string): Promise<void> => {
  await apiRequest<void>('/api/file', {
    method: 'DELETE',
    body: { file_url: fileUrl } satisfies DeleteFilePayload,
  })
}

const getChatEndpoint = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured. Unable to start internal test.')
  }

  return `${apiUrl.replace(/\/$/, '')}/chat`
}

export const sendInternalTestMessage = async (
  payload: ChatRequestPayload,
): Promise<ChatResponsePayload> => {
  const endpoint = getChatEndpoint()
  return apiRequest<ChatResponsePayload>(endpoint, {
    method: 'POST',
    body: payload,
  })
}

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

export const useInternalTestChatMutation = () =>
  useMutation({
    mutationFn: (payload: ChatRequestPayload) => sendInternalTestMessage(payload),
  })
