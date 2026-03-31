'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { useApplicantProfileQuery } from '../api'
import type { ApplicantProfile, EligibilityStatus, Recommendation } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CANDIDATE_COLORS = ['#a6d80a', '#3b82f6', '#f59e0b'] as const

const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  standard_review: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  manual_review_required: 'bg-violet-50 text-violet-700 border-violet-200',
  review_priority: 'bg-sky-50 text-sky-700 border-sky-200',
  insufficient_evidence: 'bg-orange-50 text-orange-700 border-orange-200',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200',
  invalid: 'bg-red-50 text-red-700 border-red-200',
}

const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  standard_review: 'Standard',
  manual_review_required: 'Manual Review',
  review_priority: 'Priority',
  insufficient_evidence: 'Insufficient',
  incomplete_application: 'Incomplete',
  invalid: 'Invalid',
}

const ELIGIBILITY_STYLES: Record<EligibilityStatus, string> = {
  eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  conditionally_eligible: 'bg-sky-50 text-sky-700 border-sky-200',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200',
  invalid: 'bg-red-50 text-red-700 border-red-200',
}

const ELIGIBILITY_LABELS: Record<EligibilityStatus, string> = {
  eligible: 'Eligible',
  conditionally_eligible: 'Conditional',
  incomplete_application: 'Incomplete',
  invalid: 'Invalid',
}

const ELIGIBILITY_DOTS: Record<EligibilityStatus, string> = {
  eligible: '●',
  conditionally_eligible: '◐',
  incomplete_application: '○',
  invalid: '✕',
}

// ---------------------------------------------------------------------------
// Wrapper to call hooks for up to 3 candidates
// ---------------------------------------------------------------------------
function useCandidateQueries(ids: string[]) {
  const q0 = useApplicantProfileQuery(ids[0] ?? '')
  const q1 = useApplicantProfileQuery(ids[1] ?? '')
  const q2 = useApplicantProfileQuery(ids[2] ?? '')

  const queries = [q0, q1, q2].slice(0, ids.length)
  const isLoading = queries.some((q) => q.isLoading)
  const profiles = queries
    .map((q) => q.data)
    .filter((d): d is ApplicantProfile => d != null)

  return { profiles, isLoading }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getBestIndex(values: number[], lowest = false): number[] {
  if (values.length === 0) return []
  const best = lowest ? Math.min(...values) : Math.max(...values)
  return values.reduce<number[]>((acc, v, i) => {
    if (v === best) acc.push(i)
    return acc
  }, [])
}

// ---------------------------------------------------------------------------
// Score Overview Table
// ---------------------------------------------------------------------------
function ScoreOverviewTable({ profiles }: { profiles: ApplicantProfile[] }) {
  const numericRows: Array<{
    label: string
    values: number[]
    lowest?: boolean
    suffix?: string
  }> = [
    {
      label: 'Merit Score',
      values: profiles.map((p) => p.merit_score),
    },
    {
      label: 'Confidence',
      values: profiles.map((p) => p.confidence_score),
    },
    {
      label: 'Auth. Risk',
      values: profiles.map((p) => Math.round(p.authenticity_risk)),
      lowest: true,
      suffix: '%',
    },
    {
      label: 'Potential',
      values: profiles.map((p) => p.merit_breakdown.potential),
    },
    {
      label: 'Motivation',
      values: profiles.map((p) => p.merit_breakdown.motivation),
    },
    {
      label: 'Leadership',
      values: profiles.map((p) => p.merit_breakdown.leadership_agency),
    },
    {
      label: 'Experience',
      values: profiles.map((p) => p.merit_breakdown.experience_skills),
    },
    {
      label: 'Trust',
      values: profiles.map((p) => p.merit_breakdown.trust_completeness),
    },
  ]

  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b bg-gray-50/80">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                Metric
              </th>
              {profiles.map((p, i) => (
                <th
                  key={p.candidate_id}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                    />
                    <span className="text-foreground">
                      {p.candidate_name ?? p.candidate_id}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {/* Name */}
            <tr>
              <td className="text-muted-foreground px-4 py-2.5 text-sm font-medium">Name</td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="px-4 py-2.5 text-sm font-medium">
                  {p.candidate_name ?? p.candidate_id}
                </td>
              ))}
            </tr>

            {/* Program */}
            <tr>
              <td className="text-muted-foreground px-4 py-2.5 text-sm font-medium">Program</td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="text-muted-foreground px-4 py-2.5 text-sm">
                  {p.program_name ?? '-'}
                </td>
              ))}
            </tr>

            {/* Eligibility */}
            <tr>
              <td className="text-muted-foreground px-4 py-2.5 text-sm font-medium">Eligibility</td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="px-4 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn('text-xs font-medium', ELIGIBILITY_STYLES[p.eligibility_status])}
                  >
                    {ELIGIBILITY_DOTS[p.eligibility_status]}{' '}
                    {ELIGIBILITY_LABELS[p.eligibility_status]}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Recommendation */}
            <tr>
              <td className="text-muted-foreground px-4 py-2.5 text-sm font-medium">
                Recommendation
              </td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="px-4 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn('text-xs font-medium', RECOMMENDATION_STYLES[p.recommendation])}
                  >
                    {RECOMMENDATION_LABELS[p.recommendation]}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Numeric rows */}
            {numericRows.map((row) => {
              const bestIndices = getBestIndex(row.values, row.lowest)
              return (
                <tr key={row.label}>
                  <td className="text-muted-foreground px-4 py-2.5 text-sm font-medium">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => {
                    const isBest = bestIndices.includes(i)
                    return (
                      <td
                        key={profiles[i].candidate_id}
                        className={cn(
                          'px-4 py-2.5 text-sm tabular-nums',
                          isBest && 'bg-primary/10 text-primary font-bold',
                        )}
                      >
                        {val}
                        {row.suffix ?? ''}
                        {isBest && ' ✓'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Radar Chart comparison
// ---------------------------------------------------------------------------
function ComparisonRadarChart({ profiles }: { profiles: ApplicantProfile[] }) {
  const radarData = useMemo(() => {
    const metrics = [
      { key: 'potential', label: 'Potential' },
      { key: 'motivation', label: 'Motivation' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'experience', label: 'Experience' },
      { key: 'trust', label: 'Trust' },
      { key: 'confidence', label: 'Confidence' },
    ] as const

    return metrics.map((m) => {
      const entry: Record<string, string | number> = { metric: m.label }
      profiles.forEach((p, i) => {
        let value: number
        switch (m.key) {
          case 'potential':
            value = p.merit_breakdown.potential
            break
          case 'motivation':
            value = p.merit_breakdown.motivation
            break
          case 'leadership':
            value = p.merit_breakdown.leadership_agency
            break
          case 'experience':
            value = p.merit_breakdown.experience_skills
            break
          case 'trust':
            value = p.merit_breakdown.trust_completeness
            break
          case 'confidence':
            value = p.confidence_score
            break
        }
        entry[`candidate_${i}`] = value
      })
      return entry
    })
  }, [profiles])

  return (
    <div className="border-border rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-foreground mb-4 text-base font-semibold">Skills Radar</h3>
      <div className="mx-auto h-[320px] w-full max-w-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            {profiles.map((p, i) => (
              <Radar
                key={p.candidate_id}
                name={p.candidate_name ?? p.candidate_id}
                dataKey={`candidate_${i}`}
                stroke={CANDIDATE_COLORS[i]}
                fill={CANDIDATE_COLORS[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {profiles.map((p, i) => (
          <div key={p.candidate_id} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: CANDIDATE_COLORS[i] }}
            />
            <span className="text-muted-foreground">
              {p.candidate_name ?? p.candidate_id}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Strengths & Gaps
// ---------------------------------------------------------------------------
function StrengthsGapsComparison({ profiles }: { profiles: ApplicantProfile[] }) {
  return (
    <div className="border-border rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-foreground mb-4 text-base font-semibold">Strengths &amp; Gaps</h3>
      <div className={cn('grid gap-6', profiles.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {profiles.map((p, i) => (
          <div key={p.candidate_id}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: CANDIDATE_COLORS[i] }}
              />
              <span className="text-foreground text-sm font-semibold">
                {p.candidate_name ?? p.candidate_id}
              </span>
            </div>

            {/* Strengths */}
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600">
                Strengths
              </p>
              <ul className="space-y-1">
                {p.top_strengths.slice(0, 3).map((s, idx) => (
                  <li key={idx} className="text-muted-foreground flex items-start gap-1.5 text-sm">
                    <span className="mt-0.5 text-emerald-500">●</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-orange-600">
                Gaps
              </p>
              <ul className="space-y-1">
                {p.main_gaps.slice(0, 3).map((g, idx) => (
                  <li key={idx} className="text-muted-foreground flex items-start gap-1.5 text-sm">
                    <span className="mt-0.5 text-orange-500">●</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AI Detection comparison
// ---------------------------------------------------------------------------
function AiDetectionComparison({ profiles }: { profiles: ApplicantProfile[] }) {
  const probabilities = profiles.map((p) =>
    Math.round(p.ai_detector.probability_ai_generated * 100),
  )
  const maxProb = Math.max(...probabilities)

  return (
    <div className="border-border rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-foreground mb-4 text-base font-semibold">AI Detection</h3>
      <div className="space-y-3">
        {profiles.map((p, i) => {
          const prob = probabilities[i]
          const isHighest = prob === maxProb && prob > 0
          return (
            <div key={p.candidate_id} className="flex items-center gap-4">
              <div className="flex w-40 shrink-0 items-center gap-2">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                />
                <span className="text-foreground truncate text-sm font-medium">
                  {p.candidate_name ?? p.candidate_id}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isHighest ? 'bg-amber-500' : 'bg-gray-300',
                    )}
                    style={{ width: `${prob}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'w-12 text-right text-sm font-semibold tabular-nums',
                    isHighest ? 'text-amber-600' : 'text-muted-foreground',
                  )}
                >
                  {prob}%
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  p.ai_detector.applicable
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500',
                )}
              >
                {p.ai_detector.applicable ? 'Applicable' : 'N/A'}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ComparisonView
// ---------------------------------------------------------------------------
export function ComparisonView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const ids = useMemo(() => {
    const raw = searchParams.get('ids')
    if (!raw) return []
    return raw.split(',').filter(Boolean).slice(0, 3)
  }, [searchParams])

  const { profiles, isLoading } = useCandidateQueries(ids)

  if (ids.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
        <div className="border-border rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            Select at least 2 candidates to compare.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => router.push('/applicants')}
          >
            <ArrowLeft className="size-4" />
            Back to Applicants
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
        <div className="border-border rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">Loading candidate profiles...</p>
        </div>
      </div>
    )
  }

  if (profiles.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
        <div className="border-border rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            Could not load candidate profiles. Some IDs may be invalid.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => router.push('/applicants')}
          >
            <ArrowLeft className="size-4" />
            Back to Applicants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/applicants')}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            Comparing {profiles.length} candidates
          </h1>
        </div>

        {/* Score overview */}
        <ScoreOverviewTable profiles={profiles} />

        {/* Radar chart + Strengths side by side on desktop */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonRadarChart profiles={profiles} />
          <StrengthsGapsComparison profiles={profiles} />
        </div>

        {/* AI Detection */}
        <AiDetectionComparison profiles={profiles} />
      </main>
    </div>
  )
}
