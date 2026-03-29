export interface MeritBreakdown {
  potential: number
  motivation: number
  leadership_agency: number
  experience_skills: number
  trust_completeness: number
}

export interface FeatureSnapshot {
  motivation_clarity: number
  initiative: number
  leadership_impact: number
  growth_trajectory: number
  resilience: number
  program_fit: number
  evidence_richness: number
  specificity_score: number
  evidence_count: number
  consistency_score: number
  completeness_score: number
  genericness_score: number
  contradiction_flag: boolean
}

export interface EvidenceSpan {
  dimension: string
  source: 'essay' | 'bot_answer' | 'application_form'
  text: string
}

export interface ApplicantExplanation {
  summary: string
  scoring_notes: {
    potential?: string
    motivation?: string
    confidence?: string
    leadership?: string
    experience?: string
    trust?: string
  }
}

export interface ApplicantProfile {
  candidate_id: string
  candidate_name: string
  program_name: string
  scoring_run_id: string
  scoring_version: string
  prompt_version: string
  eligibility_status: 'eligible' | 'ineligible' | 'manual_review'
  eligibility_reasons: string[]
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  recommendation: 'admit' | 'manual_review_required' | 'reject'
  review_flags: string[]
  merit_breakdown: MeritBreakdown
  feature_snapshot: FeatureSnapshot
  top_strengths: string[]
  main_gaps: string[]
  uncertainties: string[]
  evidence_spans: EvidenceSpan[]
  explanation: ApplicantExplanation
}

export type ApplicantsSortField =
  | 'score'
  | 'potential'
  | 'motivation'
  | 'leadership'
  | 'experience'
  | 'trust'

export type ApplicantsSortDirection = 'asc' | 'desc'

export interface ApplicantsQueryParams {
  sortField: ApplicantsSortField
  sortDirection: ApplicantsSortDirection
}
