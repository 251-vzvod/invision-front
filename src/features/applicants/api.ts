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

/* ─── ML stub data — easy to remove once backend provides scoring ─── */
// TODO: Remove ML_STUB when backend returns ML scoring fields

const ML_STUB = {
  scoring_run_id: 'stub',
  scoring_version: 'stub',
  prompt_version: null,
  extraction_mode: 'pending',
  extractor_version: 'pending',
  llm_metadata: { provider: 'pending', model: 'pending', latency_ms: 0 },
  merit_score: 0,
  confidence_score: 0,
  authenticity_risk: 0,
  recommendation: 'standard_review' as const,
  review_flags: [] as ApplicantProfile['review_flags'],
  eligibility_reasons: [] as ApplicantProfile['eligibility_reasons'],
  merit_breakdown: {
    potential: 0,
    motivation: 0,
    leadership_agency: 0,
    experience_skills: 0,
    trust_completeness: 0,
  },
  feature_snapshot: {
    motivation_clarity: 0,
    initiative: 0,
    leadership_impact: 0,
    growth_trajectory: 0,
    resilience: 0,
    program_fit: 0,
    evidence_richness: 0,
    specificity_score: 0,
    evidence_count: 0,
    consistency_score: 0,
    completeness_score: 0,
    genericness_score: 0,
    contradiction_flag: false,
    docs_count_score: 0,
    portfolio_links_score: 0,
    has_video_presentation: false,
    logical_source_groups_present: 0,
    material_support_score: 0,
    polished_but_empty_score: 0,
    cross_section_mismatch_score: 0,
    authenticity_risk_raw: 0,
    ai_detector_probability: 0,
    ai_detector_applicable: false,
    excluded_sensitive_fields_count: 0,
  },
  semantic_rubric_scores: {
    leadership_potential: 0,
    growth_trajectory: 0,
    motivation_authenticity: 0,
    authenticity_groundedness: 0,
    hidden_potential: 0,
  },
  top_strengths: [] as string[],
  main_gaps: [] as string[],
  uncertainties: [] as string[],
  authenticity_review_reasons: [] as string[],
  ai_detector: {
    enabled: false,
    applicable: false,
    language: 'unknown',
    probability_ai_generated: 0,
    provider: 'pending',
    model: 'pending',
    note: 'ML scoring not yet available',
  },
  committee_cohorts: [] as string[],
  why_candidate_surfaced: [] as string[],
  what_to_verify_manually: [] as string[],
  suggested_follow_up_question: '',
  evidence_spans: [] as ApplicantProfile['evidence_spans'],
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
  if (field === 'potential') return applicant.merit_breakdown.potential
  if (field === 'motivation') return applicant.merit_breakdown.motivation
  if (field === 'leadership') return applicant.merit_breakdown.leadership_agency
  if (field === 'experience') return applicant.merit_breakdown.experience_skills
  if (field === 'authenticity_risk') return applicant.authenticity_risk
  if (field === 'confidence') return applicant.confidence_score
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
