'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api-client'
import type { ApplicationFormData } from './types'

export interface SubmitApplicationPayload {
  status: 'draft' | 'submitted'
  program: {
    level: 'undergraduate' | 'foundation'
    facultyId: string | null
    specialityId: string | null
    displayLabel: string
  }
  personalInformation: ApplicationFormData['personalInformation']
  familyDetails: ApplicationFormData['familyDetails']
  contactInformation: ApplicationFormData['contactInformation']
  education: ApplicationFormData['education']
  motivation: {
    motivationLetter: ApplicationFormData['motivation']['motivationLetter']
    motivationQuestions: Array<{
      questionId: string
      answer: string
    }>
  }
  agreements: ApplicationFormData['agreements']
}

export interface SubmitApplicationResponse {
  id: string
  status: 'draft' | 'submitted'
  message?: string
}

export const prepareSubmitApplicationPayload = (
  data: ApplicationFormData,
): SubmitApplicationPayload => {
  if (!data.program) {
    throw new Error('Program is required')
  }

  return {
    status: 'submitted',
    program: data.program,
    personalInformation: data.personalInformation,
    familyDetails: data.familyDetails,
    contactInformation: data.contactInformation,
    education: data.education,
    motivation: {
      motivationLetter: data.motivation.motivationLetter,
      motivationQuestions: Object.entries(data.motivation.motivationQuestions).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      ),
    },
    agreements: data.agreements,
  }
}

export const useSubmitApplicationMutation = () =>
  useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      apiClient.post<SubmitApplicationResponse>('/api/application', payload),
  })
