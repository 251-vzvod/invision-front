import type { Metadata } from 'next'
import { ApplicantsDashboard } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Applications Dashboard — InVision',
  description: 'Manager dashboard with applicants ranking and filters',
}

export default function ApplicationsPage() {
  return <ApplicantsDashboard />
}
