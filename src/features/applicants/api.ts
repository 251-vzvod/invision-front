import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api-client'
import type { ApplicantProfile, ApplicantsQueryParams, ApplicationFormResponse } from './types'

/* ─── Query keys ─── */

export const applicantsQueryKeys = {
  all: ['applicants'] as const,
  ranking: (params: ApplicantsQueryParams) =>
    [...applicantsQueryKeys.all, 'ranking', params] as const,
  profile: (id: string) => [...applicantsQueryKeys.all, 'profile', id] as const,
}

/* ─── ML stub data — remove once backend provides scoring ─── */
// TODO: Remove ML_STUB when backend returns ML scoring fields

const ML_STUB = {
  scoring_run_id: 'stub',
  scoring_version: 'stub',
  merit_score: 0,
  confidence_score: 0,
  authenticity_risk: 0,
  recommendation: 'standard_review' as const,
  review_flags: [] as ApplicantProfile['review_flags'],
  eligibility_reasons: [] as ApplicantProfile['eligibility_reasons'],
  hidden_potential_score: 0,
  support_needed_score: 0,
  shortlist_priority_score: 0,
  evidence_coverage_score: 0,
  trajectory_score: 0,
  top_strengths: [] as string[],
  main_gaps: [] as string[],
  committee_cohorts: [] as string[],
  why_candidate_surfaced: [] as string[],
  what_to_verify_manually: [] as string[],
  suggested_follow_up_question: '',
  evidence_highlights: [] as ApplicantProfile['evidence_highlights'],
  explanation: {
    summary: 'Scoring not yet available',
    scoring_notes: {},
  },
} satisfies Omit<
  ApplicantProfile,
  'candidate_id' | 'candidate_name' | 'program_name' | 'eligibility_status'
>

/* ─── Map backend form response → ApplicantProfile ─── */
// TODO: Remove mapping when backend returns full ApplicantProfile

const mapFormToProfile = (form: ApplicationFormResponse): ApplicantProfile => {
  const name = [form.personal_information.first_name, form.personal_information.last_name]
    .filter(Boolean)
    .join(' ')

  return {
    candidate_id: String(form.id),
    candidate_name: name || `Applicant #${form.id}`,
    program_name: form.program?.faculty_id ?? form.program?.level ?? 'Unknown',
    eligibility_status:
      form.status === 'reviewed'
        ? 'eligible'
        : form.status === 'in_review'
          ? 'conditionally_eligible'
          : 'incomplete_application',
    ...ML_STUB,
  }
}

/* ─── Sorting (client-side) ─── */

const getSortValue = (
  applicant: ApplicantProfile,
  field: ApplicantsQueryParams['sortField'],
): number => {
  if (field === 'score') return applicant.merit_score
  if (field === 'confidence') return applicant.confidence_score
  if (field === 'authenticity_risk') return applicant.authenticity_risk
  if (field === 'hidden_potential') return applicant.hidden_potential_score
  if (field === 'trajectory') return applicant.trajectory_score
  if (field === 'shortlist_priority') return applicant.shortlist_priority_score
  return applicant.merit_score
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

/* ─── Analytics response (from /api/analytics route handler) ─── */

export interface FormAnalyticsData {
  total: number
  byStatus: Record<string, number>
  byProgram: Record<string, number>
  byFaculty: Record<string, number>
  byGender: Record<string, number>
  avgEnglishScore: number
  avgUntScore: number
  englishScoreDistribution: Array<{ range: string; count: number }>
  untScoreDistribution: Array<{ range: string; count: number }>
}

/* ─── Queries ─── */

export const useApplicantsRankingQuery = (params: ApplicantsQueryParams) =>
  useQuery({
    queryKey: applicantsQueryKeys.ranking(params),
    queryFn: async () => {
      const forms = await apiClient.get<ApplicationFormResponse[]>(
        '/api/applicants?page=1&size=100',
      )
      const profiles = forms.map(mapFormToProfile)
      return sortApplicants(profiles, params)
    },
    staleTime: 30_000,
  })

export const useFormAnalyticsQuery = () =>
  useQuery({
    queryKey: ['analytics', 'forms'] as const,
    queryFn: async () => apiClient.get<FormAnalyticsData>('/api/analytics'),
    staleTime: 60_000,
  })

export const useApplicantProfileQuery = (candidateId: string) =>
  useQuery({
    queryKey: applicantsQueryKeys.profile(candidateId),
    queryFn: async () => {
      const form = await apiClient.get<ApplicationFormResponse>(
        `/api/applicants/${encodeURIComponent(candidateId)}`,
      )
      return mapFormToProfile(form)
    },
    staleTime: 30_000,
  })
