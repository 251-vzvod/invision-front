import type { ApplicantsSortDirection, ApplicantsSortField } from './types'

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
