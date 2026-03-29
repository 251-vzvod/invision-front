import type { Metadata } from 'next'
import { ApplicantsDetail } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Applicant — InVision',
  description: 'Applicant details page',
}

interface ApplicantDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicantDetailPage({ params }: ApplicantDetailPageProps) {
  const { id } = await params

  return <ApplicantsDetail applicantId={id} />
}
