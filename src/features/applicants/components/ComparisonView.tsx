'use client'

import gsap from 'gsap'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useApplicantProfileQuery } from '../api'
import type { ApplicantProfile, EligibilityStatus, Recommendation } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CANDIDATE_COLORS = ['#a6d80a', '#3b82f6', '#f59e0b'] as const

const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  standard_review: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  manual_review_required: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  review_priority: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  insufficient_evidence: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  invalid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
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
  eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  conditionally_eligible: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  invalid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
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
      values: profiles.map((p) => p.hidden_potential_score),
    },
    {
      label: 'Trajectory',
      values: profiles.map((p) => p.trajectory_score),
    },
    {
      label: 'Shortlist Priority',
      values: profiles.map((p) => p.shortlist_priority_score),
    },
    {
      label: 'Evidence',
      values: profiles.map((p) => p.evidence_coverage_score),
    },
    {
      label: 'Support Needed',
      values: profiles.map((p) => p.support_needed_score),
    },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border dark:border-white/10 bg-muted/50 dark:bg-white/[0.03]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          <tbody className="divide-y divide-border">
            {/* Name */}
            <tr>
              <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground">Name</td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="px-4 py-2.5 text-sm font-medium text-foreground">
                  {p.candidate_name ?? p.candidate_id}
                </td>
              ))}
            </tr>

            {/* Program */}
            <tr>
              <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground">Program</td>
              {profiles.map((p) => (
                <td key={p.candidate_id} className="px-4 py-2.5 text-sm text-muted-foreground">
                  {p.program_name ?? '-'}
                </td>
              ))}
            </tr>

            {/* Eligibility */}
            <tr>
              <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground">Eligibility</td>
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
              <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground">
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
                  <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => {
                    const isBest = bestIndices.includes(i)
                    return (
                      <td
                        key={profiles[i].candidate_id}
                        className={cn(
                          'px-4 py-2.5 text-sm tabular-nums text-foreground/80',
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
      { key: 'trajectory', label: 'Trajectory' },
      { key: 'shortlist', label: 'Shortlist Priority' },
      { key: 'evidence', label: 'Evidence' },
      { key: 'support', label: 'Support Needed' },
      { key: 'confidence', label: 'Confidence' },
    ] as const

    return metrics.map((m) => {
      const entry: Record<string, string | number> = { metric: m.label }
      profiles.forEach((p, i) => {
        let value: number
        switch (m.key) {
          case 'potential':
            value = p.hidden_potential_score
            break
          case 'trajectory':
            value = p.trajectory_score
            break
          case 'shortlist':
            value = p.shortlist_priority_score
            break
          case 'evidence':
            value = p.evidence_coverage_score
            break
          case 'support':
            value = p.support_needed_score
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
    <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Skills Radar</h3>
      <div className="mx-auto h-[320px] w-full max-w-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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
    <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Strengths &amp; Gaps</h3>
      <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2', profiles.length === 3 && 'lg:grid-cols-3')}>
        {profiles.map((p, i) => (
          <div key={p.candidate_id}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: CANDIDATE_COLORS[i] }}
              />
              <span className="text-sm font-semibold text-foreground">
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
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
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
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
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
function AuthenticityRiskComparison({ profiles }: { profiles: ApplicantProfile[] }) {
  const risks = profiles.map((p) => Math.round(p.authenticity_risk))
  const maxRisk = Math.max(...risks)

  return (
    <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Authenticity Risk</h3>
      <div className="space-y-3">
        {profiles.map((p, i) => {
          const risk = risks[i]
          const isHighest = risk === maxRisk && risk > 0
          return (
            <div key={p.candidate_id} className="flex items-center gap-3">
              <div className="flex w-24 shrink-0 items-center gap-2 sm:w-40">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                />
                <span className="truncate text-sm font-medium text-foreground">
                  {p.candidate_name ?? p.candidate_id}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isHighest ? 'bg-amber-500' : 'bg-gray-300',
                    )}
                    style={{ width: `${risk}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'w-12 text-right text-sm font-semibold tabular-nums',
                    isHighest ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground',
                  )}
                >
                  {risk}%
                </span>
              </div>
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
  const rootRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const ids = useMemo(() => {
    const raw = searchParams.get('ids')
    if (!raw) return []
    return raw.split(',').filter(Boolean).slice(0, 3)
  }, [searchParams])

  const { profiles, isLoading } = useCandidateQueries(ids)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      gsap.fromTo(root, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    }, root)
    return () => { ctx.revert() }
  }, [])

  if (ids.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard">
        <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
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
      <div className="min-h-screen bg-dashboard">
        <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-7 w-56" />
          </div>

          {/* Score overview table skeleton */}
          <div className="overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl">
            <Skeleton className="h-10 w-full rounded-none" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center border-b border-border dark:border-white/10 px-4 last:border-b-0">
                <Skeleton className="my-2.5 h-6 w-full" />
              </div>
            ))}
          </div>

          {/* Two columns: radar + strengths */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
              <Skeleton className="mb-4 h-5 w-28" />
              <Skeleton className="mx-auto h-72 w-full max-w-[480px] rounded-xl" />
            </div>
            <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
              <Skeleton className="mb-4 h-5 w-36" />
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Detection skeleton */}
          <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
            <Skeleton className="mb-4 h-5 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24 shrink-0 sm:w-40" />
                  <Skeleton className="h-2.5 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (profiles.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard">
        <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
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
    <div ref={rootRef} className="min-h-screen bg-dashboard">
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
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

        {/* Authenticity Risk */}
        <AuthenticityRiskComparison profiles={profiles} />
      </main>
    </div>
  )
}
