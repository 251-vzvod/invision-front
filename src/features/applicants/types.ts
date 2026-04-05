/* ─── Evidence highlight from ML model ─── */

export interface EvidenceHighlight {
  claim: string
  support_level: string
  source: string
  snippet: string
  support_score: number
  rationale: string
}

/* ─── Explanation ─── */

export interface ApplicantExplanation {
  summary: string
  scoring_notes: {
    potential?: string
    motivation?: string
    confidence?: string
    authenticity_risk?: string
    recommendation?: string
  }
}

/* ─── Main profile (ML model output + frontend-derived fields) ─── */

export interface ApplicantProfile {
  /* ML model fields */
  candidate_id: string
  scoring_run_id: string
  scoring_version: string
  eligibility_status: EligibilityStatus
  eligibility_reasons: EligibilityReason[]
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  recommendation: Recommendation
  review_flags: ReviewFlag[]
  hidden_potential_score: number
  support_needed_score: number
  shortlist_priority_score: number
  evidence_coverage_score: number
  trajectory_score: number
  committee_cohorts: string[]
  why_candidate_surfaced: string[]
  what_to_verify_manually: string[]
  suggested_follow_up_question: string
  evidence_highlights: EvidenceHighlight[]
  top_strengths: string[]
  main_gaps: string[]
  explanation: ApplicantExplanation

  /* Frontend-derived (from form data) */
  candidate_name?: string
  program_name?: string
  application_status?: string
}

/* ─── Enums ─── */

export type EligibilityStatus =
  | 'invalid'
  | 'incomplete_application'
  | 'conditionally_eligible'
  | 'eligible'

export type EligibilityReason =
  | 'missing_required_materials_documents'
  | 'missing_required_materials_portfolio'
  | 'missing_required_materials_video'
  | string

export type Recommendation =
  | 'invalid'
  | 'incomplete_application'
  | 'insufficient_evidence'
  | 'review_priority'
  | 'manual_review_required'
  | 'standard_review'

export type ReviewFlag =
  | 'eligibility_gate'
  | 'low_confidence'
  | 'insufficient_evidence'
  | 'low_evidence_density'
  | 'moderate_authenticity_risk'
  | 'high_authenticity_risk'
  | 'contradiction_risk'
  | 'possible_contradiction'
  | 'polished_but_empty_pattern'
  | 'high_polished_but_empty'
  | 'high_genericness'
  | 'cross_section_mismatch'
  | 'section_mismatch'
  | 'missing_required_materials'
  | 'auxiliary_ai_generation_signal'

/* ─── Sort / query ─── */

export type CandidateDecision = 'approved' | 'rejected' | 'shortlisted' | null

export interface ApplicantsQueryParams {
  sort: 'ASC' | 'DESC'
  recommendation?: string[] | null
  eligibility?: string[] | null
  decision?: string[] | null
  page: number
  size: number
}

/* ─── ML Assessment list item (from GET /api/v1/ml-assessments) ─── */

export interface MLAssessmentListItem {
  candidate_id: number
  first_name: string
  last_name: string
  full_name: string
  program: string
  application_status: string
  eligibility_status: string | null
  recommendation: string | null
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  hidden_potential_score: number
  support_needed_score: number
  shortlist_priority_score: number
  evidence_coverage_score: number
  trajectory_score: number
  decision: 'no_decision' | 'approved' | 'shortlisted' | 'rejected'
}

export interface MLAssessmentListResponse {
  items: MLAssessmentListItem[]
  page: number
  size: number
  total: number
}

/* ─── ML Assessment detail (from GET /api/v1/forms/{id}/ml-assessment) ─── */

export interface MLAssessmentDetail {
  id: number
  created_at: string
  updated_at: string
  candidate_id: number
  scoring_run_id: string
  scoring_version: string
  eligibility_status: string
  eligibility_reasons: string[]
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  recommendation: string
  review_flags: string[]
  hidden_potential_score: number
  support_needed_score: number
  shortlist_priority_score: number
  evidence_coverage_score: number
  trajectory_score: number
  committee_cohorts: string[]
  why_candidate_surfaced: string[]
  what_to_verify_manually: string[]
  suggested_follow_up_question: string | null
  evidence_highlights: EvidenceHighlight[]
  top_strengths: string[]
  main_gaps: string[]
  explanation: ApplicantExplanation
  raw_response: Record<string, unknown>
}

/* ─── Combined response for detail endpoint ─── */

export interface ApplicantDetailResponse {
  form: ApplicationFormResponse | null
  ml_assessment: MLAssessmentDetail | null
}

/* ─── Backend form response (GET /api/v1/forms) ─── */

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ApplicationFormStatus = 'chat' | 'in_review' | 'reviewed'

export interface ApplicationFormResponse {
  id: number
  created_at: string
  updated_at: string
  status: ApplicationFormStatus
  program: {
    level: 'foundation' | 'undergraduate'
    faculty_id: string | null
  }
  personal_information: {
    first_name: string
    last_name: string
    patronymic: string | null
    birth_date: string
    gender: 'MALE' | 'FEMALE'
    citizenship: string
  }
  contact_information: {
    contacts: {
      phone: string
      whatsapp: string | null
      instagram: string | null
      telegram: string | null
    }
  }
  education: {
    english_proficiency: { type: 'ielts' | 'toefl'; score: number }
    school_certificate: { type: 'unt'; score: number }
  }
  motivation: {
    presentation: {
      link: string | null
      text: string | null
      status: ProcessingStatus
    }
    motivation_letter: {
      link: string | null
      text: string | null
      status: ProcessingStatus
    }
  }
  personal_data_consent: boolean
}

/* ─── Ranking ─── */

export type RankingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface RankedCandidate {
  candidate_id: number
  rank_position: number
  recommendation: string
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  shortlist_priority_score: number
  hidden_potential_score: number
  support_needed_score: number
  evidence_coverage_score: number
  trajectory_score: number
  is_shortlist_candidate: boolean
  is_hidden_potential_candidate: boolean
  is_support_needed_candidate: boolean
  is_authenticity_review_candidate: boolean
}

export interface RankingCreateResponse {
  ranking_id: number
  status: RankingStatus
  candidate_ids: number[]
  top_k: number | null
  celery_task_id: string | null
}

export interface RankingResult {
  id: number
  created_at: string
  updated_at: string
  status: RankingStatus
  candidate_ids: number[]
  top_k: number | null
  celery_task_id: string | null
  scoring_run_id: string | null
  scoring_version: string | null
  count: number
  returned_count: number
  ranked_candidate_ids: number[]
  shortlist_candidate_ids: number[]
  hidden_potential_candidate_ids: number[]
  support_needed_candidate_ids: number[]
  authenticity_review_candidate_ids: number[]
  ranker_metadata: Record<string, unknown>
  error_message: string | null
  items: RankedCandidate[]
  raw_response: Record<string, unknown>
}
