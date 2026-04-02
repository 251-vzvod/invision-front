import { Suspense } from 'react'
import type { Metadata } from 'next'
import { RankingView } from '@/features/applicants'

export const metadata: Metadata = { title: 'AI Ranking — InVision' }

export default function RankingPage() {
  return (
    <Suspense>
      <RankingView />
    </Suspense>
  )
}
