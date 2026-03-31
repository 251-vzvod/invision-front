import type { Metadata } from 'next'
import { AnalyticsDashboard } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Analytics — InVision',
  description: 'Aggregated insights and statistics across all candidates',
}

export default function AnalyticsPage() {
  return <AnalyticsDashboard />
}
