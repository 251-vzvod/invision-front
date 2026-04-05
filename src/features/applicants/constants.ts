import type {
  ApplicantsQueryParams,
  CandidateDecision,
  EligibilityStatus,
  Recommendation,
} from './types'

export const DEFAULT_QUERY_PARAMS: ApplicantsQueryParams = {
  sort: 'DESC',
  page: 1,
  size: 25,
}

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
