import type {
  ApplicantsSortDirection,
  ApplicantsSortField,
  CandidateDecision,
  EligibilityStatus,
  Recommendation,
} from './types'

export const DEFAULT_SORT_FIELD: ApplicantsSortField = 'score'
export const DEFAULT_SORT_DIRECTION: ApplicantsSortDirection = 'desc'

export const SORT_FIELD_BUTTONS: Array<{ value: ApplicantsSortField; label: string }> = [
  { value: 'score', label: 'By score' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'hidden_potential', label: 'Hidden Potential' },
  { value: 'trajectory', label: 'Trajectory' },
  { value: 'shortlist_priority', label: 'Shortlist Priority' },
  { value: 'authenticity_risk', label: 'Authenticity Risk' },
]

export const ELIGIBILITY_OPTIONS: Array<{
  value: EligibilityStatus
  label: string
  dotClassName: string
}> = [
  { value: 'eligible', label: 'Eligible', dotClassName: 'bg-emerald-500' },
  { value: 'conditionally_eligible', label: 'Conditionally Eligible', dotClassName: 'bg-sky-500' },
  { value: 'incomplete_application', label: 'Incomplete Application', dotClassName: 'bg-amber-500' },
  { value: 'invalid', label: 'Invalid', dotClassName: 'bg-red-500' },
]

export const RECOMMENDATION_OPTIONS: Array<{
  value: Recommendation
  label: string
  dotClassName: string
}> = [
  { value: 'standard_review', label: 'Standard Review', dotClassName: 'bg-emerald-500' },
  { value: 'manual_review_required', label: 'Manual Review', dotClassName: 'bg-violet-500' },
  { value: 'review_priority', label: 'Review Priority', dotClassName: 'bg-sky-500' },
  { value: 'insufficient_evidence', label: 'Insufficient Evidence', dotClassName: 'bg-orange-500' },
  { value: 'incomplete_application', label: 'Incomplete Application', dotClassName: 'bg-amber-500' },
  { value: 'invalid', label: 'Invalid', dotClassName: 'bg-red-500' },
]

export type DecisionFilterValue = NonNullable<CandidateDecision> | 'pending'

export const DECISION_OPTIONS: Array<{
  value: DecisionFilterValue
  label: string
  dotClassName: string
}> = [
  { value: 'pending', label: 'No Decision', dotClassName: 'bg-gray-400' },
  { value: 'approved', label: 'Approved', dotClassName: 'bg-emerald-500' },
  { value: 'shortlisted', label: 'Shortlisted', dotClassName: 'bg-amber-500' },
  { value: 'rejected', label: 'Rejected', dotClassName: 'bg-red-500' },
]
