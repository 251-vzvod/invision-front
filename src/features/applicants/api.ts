import { useQuery } from '@tanstack/react-query'
import { MOCK_APPLICANT_PROFILES } from './constants'
import type { ApplicantProfile, ApplicantsQueryParams } from './types'

const applicantsQueryKeys = {
  all: ['applicants'] as const,
  ranking: (params: ApplicantsQueryParams) =>
    [...applicantsQueryKeys.all, 'ranking', params] as const,
  profile: (candidateId: string) => [...applicantsQueryKeys.all, 'profile', candidateId] as const,
}

const getSortValue = (
  applicant: ApplicantProfile,
  field: ApplicantsQueryParams['sortField'],
): number => {
  if (field === 'score') {
    return applicant.merit_score
  }

  if (field === 'potential') {
    return applicant.merit_breakdown.potential
  }

  if (field === 'motivation') {
    return applicant.merit_breakdown.motivation
  }

  if (field === 'leadership') {
    return applicant.merit_breakdown.leadership_agency
  }

  if (field === 'experience') {
    return applicant.merit_breakdown.experience_skills
  }

  return applicant.merit_breakdown.trust_completeness
}

const sortApplicants = (
  applicants: ApplicantProfile[],
  params: ApplicantsQueryParams,
): ApplicantProfile[] => {
  const { sortField, sortDirection } = params

  return [...applicants].sort((first, second) => {
    const firstValue = getSortValue(first, sortField)
    const secondValue = getSortValue(second, sortField)

    if (firstValue === secondValue) {
      return second.merit_score - first.merit_score
    }

    return sortDirection === 'asc' ? firstValue - secondValue : secondValue - firstValue
  })
}

export const useApplicantsRankingQuery = (params: ApplicantsQueryParams) =>
  useQuery({
    queryKey: applicantsQueryKeys.ranking(params),
    queryFn: async () => sortApplicants(MOCK_APPLICANT_PROFILES, params),
    staleTime: 30_000,
  })

export const useApplicantProfileQuery = (candidateId: string) =>
  useQuery({
    queryKey: applicantsQueryKeys.profile(candidateId),
    queryFn: async () =>
      MOCK_APPLICANT_PROFILES.find((profile) => profile.candidate_id === candidateId) ?? null,
    staleTime: 30_000,
  })
