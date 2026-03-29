import type { Metadata } from 'next'
import { ApplicantsDashboard } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Applicants Dashboard — InVision',
  description: 'Manager dashboard with applicants ranking and filters',
}

export default function ApplicantsPage() {
  return <ApplicantsDashboard />
}
