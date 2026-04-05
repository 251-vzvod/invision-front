import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api-client'
import type {
  ApplicantDetailResponse,
  ApplicantProfile,
  ApplicantsQueryParams,
  EligibilityStatus,
  MLAssessmentListItem,
  MLAssessmentListResponse,
  RankingCreateResponse,
  RankingResult,
  Recommendation,
  ReviewFlag,
} from './types'

/* ─── Query keys ─── */

export const applicantsQueryKeys = {
  all: ['applicants'] as const,
  ranking: (params: ApplicantsQueryParams) =>
    [...applicantsQueryKeys.all, 'ranking', params] as const,
  profile: (id: string) => [...applicantsQueryKeys.all, 'profile', id] as const,
}

/* ─── Map ML list item → ApplicantProfile ─── */

const mapMLListItemToProfile = (item: MLAssessmentListItem): ApplicantProfile => ({
  candidate_id: String(item.candidate_id),
  candidate_name: item.full_name,
  program_name: item.program,
  application_status: item.application_status,
  eligibility_status: (item.eligibility_status as EligibilityStatus) ?? 'incomplete_application',
  recommendation: (item.recommendation as Recommendation) ?? 'standard_review',
  merit_score: item.merit_score,
  confidence_score: item.confidence_score,
  authenticity_risk: item.authenticity_risk,
  hidden_potential_score: item.hidden_potential_score,
  support_needed_score: item.support_needed_score,
  shortlist_priority_score: item.shortlist_priority_score,
  evidence_coverage_score: item.evidence_coverage_score,
  trajectory_score: item.trajectory_score,
  // Fields not available in list response - use empty defaults
  scoring_run_id: '',
  scoring_version: '',
  eligibility_reasons: [],
  review_flags: [],
  committee_cohorts: [],
  why_candidate_surfaced: [],
  what_to_verify_manually: [],
  suggested_follow_up_question: '',
  evidence_highlights: [],
  top_strengths: [],
  main_gaps: [],
  explanation: { summary: '', scoring_notes: {} },
})

/* ─── Map combined detail response → ApplicantProfile ─── */

const mapDetailResponseToProfile = (response: ApplicantDetailResponse): ApplicantProfile => {
  const { form, ml_assessment } = response

  const name = form
    ? [form.personal_information.first_name, form.personal_information.last_name]
        .filter(Boolean)
        .join(' ')
    : null

  const programName = form?.program?.faculty_id ?? form?.program?.level ?? null

  if (!ml_assessment) {
    // No ML assessment yet - return basic profile from form data
    return {
      candidate_id: String(form?.id ?? '0'),
      candidate_name: name || `Applicant #${form?.id ?? '?'}`,
      program_name: programName ?? 'Unknown',
      application_status: form?.status,
      eligibility_status: 'incomplete_application',
      recommendation: 'standard_review',
      merit_score: 0,
      confidence_score: 0,
      authenticity_risk: 0,
      hidden_potential_score: 0,
      support_needed_score: 0,
      shortlist_priority_score: 0,
      evidence_coverage_score: 0,
      trajectory_score: 0,
      scoring_run_id: '',
      scoring_version: '',
      eligibility_reasons: [],
      review_flags: [],
      committee_cohorts: [],
      why_candidate_surfaced: [],
      what_to_verify_manually: [],
      suggested_follow_up_question: '',
      evidence_highlights: [],
      top_strengths: [],
      main_gaps: [],
      explanation: { summary: 'ML assessment not yet available.', scoring_notes: {} },
    }
  }

  return {
    candidate_id: String(ml_assessment.candidate_id),
    candidate_name: name || `Applicant #${ml_assessment.candidate_id}`,
    program_name: programName ?? 'Unknown',
    application_status: form?.status,
    eligibility_status: ml_assessment.eligibility_status as EligibilityStatus,
    recommendation: ml_assessment.recommendation as Recommendation,
    merit_score: ml_assessment.merit_score,
    confidence_score: ml_assessment.confidence_score,
    authenticity_risk: ml_assessment.authenticity_risk,
    hidden_potential_score: ml_assessment.hidden_potential_score,
    support_needed_score: ml_assessment.support_needed_score,
    shortlist_priority_score: ml_assessment.shortlist_priority_score,
    evidence_coverage_score: ml_assessment.evidence_coverage_score,
    trajectory_score: ml_assessment.trajectory_score,
    scoring_run_id: ml_assessment.scoring_run_id,
    scoring_version: ml_assessment.scoring_version,
    eligibility_reasons: ml_assessment.eligibility_reasons,
    review_flags: ml_assessment.review_flags as ReviewFlag[],
    committee_cohorts: ml_assessment.committee_cohorts,
    why_candidate_surfaced: ml_assessment.why_candidate_surfaced,
    what_to_verify_manually: ml_assessment.what_to_verify_manually,
    suggested_follow_up_question: ml_assessment.suggested_follow_up_question ?? '',
    evidence_highlights: ml_assessment.evidence_highlights,
    top_strengths: ml_assessment.top_strengths,
    main_gaps: ml_assessment.main_gaps,
    explanation: ml_assessment.explanation,
  }
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
      const parts = [
        `page=${params.page}`,
        `size=${params.size}`,
        `sort=${params.sort}`,
      ]
      if (params.recommendation?.length) parts.push(`recommendation=${params.recommendation.join(',')}`)
      if (params.eligibility?.length) parts.push(`eligibility=${params.eligibility.join(',')}`)
      if (params.decision?.length) parts.push(`decision=${params.decision.join(',')}`)

      const response = await apiClient.get<MLAssessmentListResponse>(
        `/api/applicants?${parts.join('&')}`,
      )
      const profiles = response.items.map(mapMLListItemToProfile)
      return {
        items: profiles,
        page: response.page,
        size: response.size,
        total: response.total,
        hasMore: response.items.length === params.size,
      }
    },
    staleTime: 30_000,
  })

export const useFormAnalyticsQuery = () =>
  useQuery({
    queryKey: ['analytics', 'forms'] as const,
    queryFn: async () => apiClient.get<FormAnalyticsData>('/api/analytics'),
    staleTime: 60_000,
  })

export const useRankCandidatesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (candidateIds: string[]) =>
      apiClient.post<unknown>('/api/rank', { candidate_ids: candidateIds.map(Number) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantsQueryKeys.all })
    },
  })
}

export const useApplicantProfileQuery = (candidateId: string) =>
  useQuery({
    queryKey: applicantsQueryKeys.profile(candidateId),
    queryFn: async () => {
      const response = await apiClient.get<ApplicantDetailResponse>(
        `/api/applicants/${encodeURIComponent(candidateId)}`,
      )
      return mapDetailResponseToProfile(response)
    },
    staleTime: 30_000,
  })

/* ─── Ranking ─── */

export const useStartRankingMutation = () =>
  useMutation({
    mutationFn: (payload: { candidate_ids: number[]; top_k?: number }) =>
      apiClient.post<RankingCreateResponse>('/api/rankings', payload),
  })

export const useRankingResultQuery = (rankingId: number | null) =>
  useQuery({
    queryKey: ['ranking-result', rankingId] as const,
    queryFn: async () => {
      const result = await apiClient.get<RankingResult>(`/api/rankings/${rankingId}`)
      return result
    },
    enabled: rankingId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return 3000
    },
    staleTime: 0,
  })
