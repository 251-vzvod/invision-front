import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ComparisonView } from '@/features/applicants'

export const metadata: Metadata = {
  title: 'Compare Candidates — InVision',
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading comparison...</p>
        </div>
      }
    >
      <ComparisonView />
    </Suspense>
  )
}
