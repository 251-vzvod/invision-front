import type {
  ApplicantsSortDirection,
  ApplicantsSortField,
  EligibilityStatus,
  Recommendation,
} from './types'

export const DEFAULT_SORT_FIELD: ApplicantsSortField = 'score'
export const DEFAULT_SORT_DIRECTION: ApplicantsSortDirection = 'desc'

export const SORT_FIELD_BUTTONS: Array<{ value: ApplicantsSortField; label: string }> = [
  { value: 'score', label: 'By score' },
  { value: 'potential', label: 'Potential' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'experience', label: 'Experience' },
  { value: 'trust', label: 'Trust' },
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
