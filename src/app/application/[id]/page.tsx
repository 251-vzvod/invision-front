import type { Metadata } from 'next'
import { ApplicantsDetail } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Application — InVision',
  description: 'Applicant details page',
}

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params

  return <ApplicantsDetail applicantId={id} />
}
