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
  eligibility_status: 'invalid' | 'incomplete_application' | 'conditionally_eligible' | 'eligible'
  eligibility_reasons: EligibilityReason[]
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  recommendation: Recommendation
  review_flags: ReviewFlag[]
  merit_breakdown: MeritBreakdown
  feature_snapshot: FeatureSnapshot
  top_strengths: string[]
  main_gaps: string[]
  uncertainties: string[]
  evidence_spans: EvidenceSpan[]
  explanation: ApplicantExplanation
}

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
