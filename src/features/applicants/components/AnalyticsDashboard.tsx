'use client'

import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import {
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  ChevronRight,
  Activity,
  Bot,
  CheckCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { cn } from '@/shared/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { Skeleton } from '@/shared/ui/skeleton'
import { useApplicantsRankingQuery } from '../api'
import type {
  ApplicantProfile,
  EligibilityStatus,
  Recommendation,
  ReviewFlag,
} from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELIGIBILITY_COLORS: Record<string, string> = {
  eligible: '#10b981',
  conditionally_eligible: '#0ea5e9',
  incomplete_application: '#f59e0b',
  invalid: '#ef4444',
}

const ELIGIBILITY_LABELS: Record<string, string> = {
  eligible: 'Eligible',
  conditionally_eligible: 'Conditional',
  incomplete_application: 'Incomplete',
  invalid: 'Invalid',
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  standard_review: '#10b981',
  manual_review_required: '#8b5cf6',
  review_priority: '#0ea5e9',
  insufficient_evidence: '#f97316',
  incomplete_application: '#f59e0b',
  invalid: '#ef4444',
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  standard_review: 'Standard Review',
  manual_review_required: 'Manual Review',
  review_priority: 'Review Priority',
  insufficient_evidence: 'Insufficient Evidence',
  incomplete_application: 'Incomplete Application',
  invalid: 'Invalid',
}

const FLAG_LABELS: Record<string, string> = {
  eligibility_gate: 'Eligibility Gate',
  low_confidence: 'Low Confidence',
  insufficient_evidence: 'Insufficient Evidence',
  low_evidence_density: 'Low Evidence Density',
  moderate_authenticity_risk: 'Moderate Authenticity Risk',
  high_authenticity_risk: 'High Authenticity Risk',
  contradiction_risk: 'Contradiction Risk',
  possible_contradiction: 'Possible Contradiction',
  polished_but_empty_pattern: 'Polished but Empty',
  high_polished_but_empty: 'High Polished but Empty',
  high_genericness: 'High Genericness',
  cross_section_mismatch: 'Cross-Section Mismatch',
  section_mismatch: 'Section Mismatch',
  missing_required_materials: 'Missing Materials',
  auxiliary_ai_generation_signal: 'AI Generation Signal',
}

const radarConfig: ChartConfig = {
  value: { label: 'Average', color: '#a6d80a' },
}

const funnelConfig: ChartConfig = {
  count: { label: 'Candidates', color: '#10b981' },
}

// ---------------------------------------------------------------------------
// Stat computation helpers
// ---------------------------------------------------------------------------

interface AnalyticsStats {
  totalApplicants: number
  avgMeritScore: number
  avgConfidence: number
  highRiskCount: number
  scoreDistribution: Array<{ range: string; count: number }>
  eligibilityBreakdown: Array<{ name: string; value: number; color: string }>
  recommendationDistribution: Array<{ name: string; count: number; color: string }>
  topFlags: Array<{ flag: string; label: string; count: number }>
  avgAiProbability: number
  aiDistribution: Array<{ range: string; count: number }>
  aiApplicableCount: number
  aiNotApplicableCount: number
  avgMeritBreakdown: Array<{ subject: string; value: number }>
  funnel: Array<{ label: string; count: number }>
}

function computeStats(applicants: ApplicantProfile[]): AnalyticsStats {
  const total = applicants.length
  if (total === 0) {
    return {
      totalApplicants: 0,
      avgMeritScore: 0,
      avgConfidence: 0,
      highRiskCount: 0,
      scoreDistribution: [],
      eligibilityBreakdown: [],
      recommendationDistribution: [],
      topFlags: [],
      avgAiProbability: 0,
      aiDistribution: [],
      aiApplicableCount: 0,
      aiNotApplicableCount: 0,
      avgMeritBreakdown: [],
      funnel: [],
    }
  }

  // KPIs
  const avgMeritScore = Math.round(
    applicants.reduce((sum, a) => sum + a.merit_score, 0) / total,
  )
  const avgConfidence = Math.round(
    applicants.reduce((sum, a) => sum + a.confidence_score, 0) / total,
  )
  const highRiskCount = applicants.filter((a) => a.authenticity_risk > 60).length

  // Score distribution
  const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100']
  const scoreBuckets = [0, 0, 0, 0, 0]
  for (const a of applicants) {
    const s = a.merit_score
    if (s <= 20) scoreBuckets[0]++
    else if (s <= 40) scoreBuckets[1]++
    else if (s <= 60) scoreBuckets[2]++
    else if (s <= 80) scoreBuckets[3]++
    else scoreBuckets[4]++
  }
  const scoreDistribution = ranges.map((range, i) => ({ range, count: scoreBuckets[i] }))

  // Eligibility breakdown
  const eligMap = new Map<string, number>()
  for (const a of applicants) {
    eligMap.set(a.eligibility_status, (eligMap.get(a.eligibility_status) ?? 0) + 1)
  }
  const eligibilityBreakdown = Array.from(eligMap.entries()).map(([status, value]) => ({
    name: ELIGIBILITY_LABELS[status] ?? status,
    value,
    color: ELIGIBILITY_COLORS[status] ?? '#94a3b8',
  }))

  // Recommendation distribution
  const recMap = new Map<string, number>()
  for (const a of applicants) {
    recMap.set(a.recommendation, (recMap.get(a.recommendation) ?? 0) + 1)
  }
  const recommendationDistribution = Array.from(recMap.entries())
    .map(([rec, count]) => ({
      name: RECOMMENDATION_LABELS[rec] ?? rec,
      count,
      color: RECOMMENDATION_COLORS[rec] ?? '#94a3b8',
    }))
    .sort((a, b) => b.count - a.count)

  // Top flags
  const flagMap = new Map<string, number>()
  for (const a of applicants) {
    for (const flag of a.review_flags) {
      flagMap.set(flag, (flagMap.get(flag) ?? 0) + 1)
    }
  }
  const topFlags = Array.from(flagMap.entries())
    .map(([flag, count]) => ({
      flag,
      label: FLAG_LABELS[flag] ?? flag,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // AI detection
  const aiApplicable = applicants.filter((a) => a.ai_detector.applicable)
  const aiApplicableCount = aiApplicable.length
  const aiNotApplicableCount = total - aiApplicableCount
  const avgAiProbability =
    aiApplicable.length > 0
      ? Math.round(
          (aiApplicable.reduce((s, a) => s + a.ai_detector.probability_ai_generated, 0) /
            aiApplicable.length) *
            100,
        )
      : 0

  const aiLow = aiApplicable.filter((a) => a.ai_detector.probability_ai_generated < 0.33).length
  const aiMed = aiApplicable.filter(
    (a) =>
      a.ai_detector.probability_ai_generated >= 0.33 &&
      a.ai_detector.probability_ai_generated < 0.66,
  ).length
  const aiHigh = aiApplicable.filter((a) => a.ai_detector.probability_ai_generated >= 0.66).length
  const aiDistribution = [
    { range: 'Low (<33%)', count: aiLow },
    { range: 'Medium (33-66%)', count: aiMed },
    { range: 'High (>66%)', count: aiHigh },
  ]

  // Average merit breakdown
  const avgPotential = Math.round(
    applicants.reduce((s, a) => s + a.merit_breakdown.potential, 0) / total,
  )
  const avgMotivation = Math.round(
    applicants.reduce((s, a) => s + a.merit_breakdown.motivation, 0) / total,
  )
  const avgLeadership = Math.round(
    applicants.reduce((s, a) => s + a.merit_breakdown.leadership_agency, 0) / total,
  )
  const avgExperience = Math.round(
    applicants.reduce((s, a) => s + a.merit_breakdown.experience_skills, 0) / total,
  )
  const avgTrust = Math.round(
    applicants.reduce((s, a) => s + a.merit_breakdown.trust_completeness, 0) / total,
  )
  const avgMeritBreakdown = [
    { subject: 'Potential', value: avgPotential },
    { subject: 'Motivation', value: avgMotivation },
    { subject: 'Leadership', value: avgLeadership },
    { subject: 'Experience', value: avgExperience },
    { subject: 'Trust', value: avgTrust },
  ]

  // Funnel
  const eligible = applicants.filter(
    (a) => a.eligibility_status === 'eligible' || a.eligibility_status === 'conditionally_eligible',
  ).length
  const passedConfidence = applicants.filter(
    (a) =>
      (a.eligibility_status === 'eligible' ||
        a.eligibility_status === 'conditionally_eligible') &&
      a.confidence_score > 50,
  ).length
  const lowRisk = applicants.filter(
    (a) =>
      (a.eligibility_status === 'eligible' ||
        a.eligibility_status === 'conditionally_eligible') &&
      a.confidence_score > 50 &&
      a.authenticity_risk < 40,
  ).length
  const readyForReview = applicants.filter(
    (a) =>
      (a.eligibility_status === 'eligible' ||
        a.eligibility_status === 'conditionally_eligible') &&
      a.confidence_score > 50 &&
      a.authenticity_risk < 40 &&
      a.review_flags.length === 0,
  ).length

  const funnel = [
    { label: 'Total Applied', count: total },
    { label: 'Eligible', count: eligible },
    { label: 'Confidence >50', count: passedConfidence },
    { label: 'Low Risk (<40)', count: lowRisk },
    { label: 'Ready for Review', count: readyForReview },
  ]

  return {
    totalApplicants: total,
    avgMeritScore,
    avgConfidence,
    highRiskCount,
    scoreDistribution,
    eligibilityBreakdown,
    recommendationDistribution,
    topFlags,
    avgAiProbability,
    aiDistribution,
    aiApplicableCount,
    aiNotApplicableCount,
    avgMeritBreakdown,
    funnel,
  }
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

/** Circular progress ring used for score/confidence KPIs */
function ProgressRing({
  value,
  max = 100,
  size = 56,
  strokeWidth = 5,
  color,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  )
}

/** Score color helper */
function scoreColor(value: number): string {
  if (value > 70) return '#10b981'
  if (value > 40) return '#f59e0b'
  return '#ef4444'
}

/** AI distribution bar segment colors */
const AI_SEGMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444']

/** Custom tooltip for all charts */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border dark:border-white/10 bg-popover px-3.5 py-2.5 shadow-lg">
      {label && (
        <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {entry.name}:{' '}
          <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

/** Section card wrapper */
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6',
        className,
      )}
    >
      <div className="mb-5 flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

/** Bar chart gradient definition */
function EmeraldGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
      </linearGradient>
    </defs>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-dashboard">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* KPI cards skeleton */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6"
            >
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="mb-2 h-9 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Score distribution skeleton */}
        <div className="mb-6 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6">
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>

        {/* Two-column skeleton */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6"
            >
              <Skeleton className="mb-4 h-5 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row skeleton */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6"
            >
              <Skeleton className="mb-4 h-5 w-36" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AnalyticsDashboard() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { data: applicants, isLoading } = useApplicantsRankingQuery({
    sortField: 'score',
    sortDirection: 'desc',
  })

  const stats = useMemo(() => computeStats(applicants ?? []), [applicants])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      gsap.fromTo(root, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    }, root)
    return () => { ctx.revert() }
  }, [])

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  // Find the peak score bucket for the insight text
  const peakBucket = stats.scoreDistribution.reduce(
    (best, cur) => (cur.count > best.count ? cur : best),
    { range: '', count: 0 },
  )

  return (
    <div ref={rootRef} className="min-h-screen bg-dashboard">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregated insights across{' '}
            <span className="font-medium text-foreground/80">
              {stats.totalApplicants}
            </span>{' '}
            candidates
            <span className="ml-2 text-muted-foreground/50">
              &middot; Last updated: just now
            </span>
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* KPI Cards                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Total Applicants */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Applicants
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {stats.totalApplicants}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">All submissions</p>
          </div>

          {/* Avg Merit Score */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Merit Score
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {stats.avgMeritScore}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">out of 100</p>
              </div>
              <div className="relative">
                <ProgressRing
                  value={stats.avgMeritScore}
                  color={scoreColor(stats.avgMeritScore)}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: scoreColor(stats.avgMeritScore) }}
                >
                  {stats.avgMeritScore}
                </span>
              </div>
            </div>
          </div>

          {/* Avg Confidence */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Confidence
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {stats.avgConfidence}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">out of 100</p>
              </div>
              <div className="relative">
                <ProgressRing
                  value={stats.avgConfidence}
                  color={scoreColor(stats.avgConfidence)}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: scoreColor(stats.avgConfidence) }}
                >
                  {stats.avgConfidence}
                </span>
              </div>
            </div>
          </div>

          {/* High Risk */}
          <div
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent',
              stats.highRiskCount > 0
                ? 'border-red-500/30 bg-red-500/10'
                : 'border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl',
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  stats.highRiskCount > 0 ? 'bg-red-100 dark:bg-red-500/15' : 'bg-emerald-100 dark:bg-emerald-500/15',
                )}
              >
                {stats.highRiskCount > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
            </div>
            {stats.highRiskCount > 0 ? (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight text-red-600">
                  {stats.highRiskCount}
                </p>
                <p className="mt-1 text-xs text-red-400/70">
                  authenticity risk &gt; 60
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-400">
                  0
                </p>
                <p className="mt-1 text-xs text-emerald-400/70">
                  All clear &mdash; no high risk
                </p>
              </>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Score Distribution (full width)                                  */}
        {/* ---------------------------------------------------------------- */}
        <SectionCard
          title="Merit Score Distribution"
          icon={TrendingUp}
          className="mb-6"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.scoreDistribution}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <EmeraldGradient id="barGradient" />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'var(--accent)' }}
                />
                <Bar
                  dataKey="count"
                  name="Candidates"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={64}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {peakBucket.count > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground/50">
              Most candidates scored between{' '}
              <span className="font-medium text-muted-foreground">
                {peakBucket.range}
              </span>
            </p>
          )}
        </SectionCard>

        {/* ---------------------------------------------------------------- */}
        {/* Eligibility + Recommendations                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Eligibility Donut */}
          <SectionCard title="Eligibility Breakdown" icon={Shield}>
            <div className="flex flex-col items-center">
              <div className="relative h-52 w-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.eligibilityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {stats.eligibilityBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {stats.totalApplicants}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {stats.eligibilityBreakdown.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Recommendation Distribution */}
          <SectionCard title="Recommendation Distribution" icon={Activity}>
            <div className="space-y-3.5">
              {stats.recommendationDistribution.map((rec) => {
                const pct =
                  stats.totalApplicants > 0
                    ? Math.round((rec.count / stats.totalApplicants) * 100)
                    : 0
                return (
                  <div key={rec.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {rec.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/50">{pct}%</span>
                        <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/80">
                          {rec.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, rec.count > 0 ? 4 : 0)}%`,
                          backgroundColor: rec.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Review Flags + AI Detection                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Top Review Flags */}
          <SectionCard title="Top Review Flags" icon={AlertTriangle}>
            {stats.topFlags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-medium text-muted-foreground">
                  No review flags
                </p>
                <p className="text-xs text-muted-foreground/50">
                  All applicants passed checks
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topFlags.map((flag, index) => {
                  const ratio =
                    stats.totalApplicants > 0
                      ? (flag.count / stats.totalApplicants) * 100
                      : 0
                  return (
                    <div key={flag.flag} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-400">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="truncate text-sm text-muted-foreground">
                            {flag.label}
                          </span>
                          <span className="ml-2 inline-flex shrink-0 items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                            {flag.count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                            style={{
                              width: `${Math.max(ratio, flag.count > 0 ? 4 : 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* AI Detection */}
          <SectionCard title="AI Detection Overview" icon={Bot}>
            <div className="flex flex-col items-center">
              {/* Big ring */}
              <div className="relative mb-4">
                <ProgressRing
                  value={stats.avgAiProbability}
                  size={120}
                  strokeWidth={10}
                  color={
                    stats.avgAiProbability > 66
                      ? '#ef4444'
                      : stats.avgAiProbability > 33
                        ? '#f59e0b'
                        : '#10b981'
                  }
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {stats.avgAiProbability}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    avg AI prob
                  </span>
                </div>
              </div>

              {/* Segmented horizontal bar */}
              <div className="mb-3 w-full">
                <div className="flex h-5 w-full overflow-hidden rounded-full">
                  {stats.aiDistribution.map((seg, i) => {
                    const total = stats.aiDistribution.reduce(
                      (s, d) => s + d.count,
                      0,
                    )
                    const pct =
                      total > 0
                        ? Math.max((seg.count / total) * 100, seg.count > 0 ? 6 : 0)
                        : 0
                    return (
                      <div
                        key={seg.range}
                        className="flex items-center justify-center text-[10px] font-semibold text-white dark:text-white transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: AI_SEGMENT_COLORS[i],
                        }}
                      >
                        {seg.count > 0 && seg.count}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground/50">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {stats.aiApplicableCount} applicable
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {stats.aiNotApplicableCount} not applicable
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Merit Radar + Candidate Funnel                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Average Merit Breakdown" icon={TrendingUp}>
            <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-72 w-full">
              <RadarChart data={stats.avgMeritBreakdown} outerRadius="72%">
                <PolarGrid stroke="rgba(166,216,10,0.35)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Radar
                  dataKey="value"
                  fill="var(--color-value)"
                  fillOpacity={0.24}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          </SectionCard>

          <SectionCard title="Candidate Funnel" icon={Activity}>
            <ChartContainer config={funnelConfig} className="h-72 w-full">
              <BarChart
                data={stats.funnel}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 6, 6, 0]}
                  barSize={28}
                />
              </BarChart>
            </ChartContainer>
          </SectionCard>
        </div>

        {/* Old funnel removed — now in the grid with radar above */}
      </div>
    </div>
  )
}
