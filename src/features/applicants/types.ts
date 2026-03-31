export interface MeritBreakdown {
  potential: number
  motivation: number
  leadership_agency: number
  experience_skills: number
  trust_completeness: number
}

export interface LlmMetadata {
  provider: string
  model: string
  latency_ms: number
}

export interface SemanticRubricScores {
  leadership_potential: number
  growth_trajectory: number
  motivation_authenticity: number
  authenticity_groundedness: number
  hidden_potential: number
}

export interface AiDetector {
  enabled: boolean
  applicable: boolean
  language: string
  probability_ai_generated: number
  provider: string
  model: string
  note: string
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
  docs_count_score: number
  portfolio_links_score: number
  has_video_presentation: boolean
  logical_source_groups_present: number
  material_support_score: number
  polished_but_empty_score: number
  cross_section_mismatch_score: number
  authenticity_risk_raw: number
  ai_detector_probability: number
  ai_detector_applicable: boolean
  excluded_sensitive_fields_count: number
}

export interface EvidenceSpan {
  source: string
  snippet: string
}

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

export interface ApplicantProfile {
  candidate_id: string
  candidate_name?: string
  program_name?: string
  scoring_run_id: string
  scoring_version: string
  prompt_version: string | null
  extraction_mode: string
  extractor_version: string
  llm_metadata: LlmMetadata
  eligibility_status: 'invalid' | 'incomplete_application' | 'conditionally_eligible' | 'eligible'
  eligibility_reasons: EligibilityReason[]
  merit_score: number
  confidence_score: number
  authenticity_risk: number
  recommendation: Recommendation
  review_flags: ReviewFlag[]
  merit_breakdown: MeritBreakdown
  feature_snapshot: FeatureSnapshot
  semantic_rubric_scores: SemanticRubricScores
  top_strengths: string[]
  main_gaps: string[]
  uncertainties: string[]
  authenticity_review_reasons: string[]
  ai_detector: AiDetector
  committee_cohorts: string[]
  why_candidate_surfaced: string[]
  what_to_verify_manually: string[]
  suggested_follow_up_question: string
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
  | 'auxiliary_ai_generation_signal'

export type ApplicantsSortField =
  | 'score'
  | 'potential'
  | 'motivation'
  | 'leadership'
  | 'experience'
  | 'trust'
  | 'authenticity_risk'
  | 'confidence'

export type CandidateDecision = 'approved' | 'rejected' | 'shortlisted' | null

export type ApplicantsSortDirection = 'asc' | 'desc'

export type EligibilityStatus = ApplicantProfile['eligibility_status']

export interface ApplicantsQueryParams {
  sortField: ApplicantsSortField
  sortDirection: ApplicantsSortDirection
}
