'use client'

import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import {
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
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
import { useFormAnalyticsQuery } from '../api'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  chat: '#f59e0b',
  in_review: '#0ea5e9',
  reviewed: '#10b981',
}

const STATUS_LABELS: Record<string, string> = {
  chat: 'In Chat',
  in_review: 'In Review',
  reviewed: 'Reviewed',
}

const FACULTY_LABELS: Record<string, string> = {
  society: 'Society',
  art_media: 'Art + Media',
  tech: 'Tech',
  policy_reform: 'Policy Reform',
  engineering: 'Engineering',
  foundation: 'Foundation',
}

const GENDER_COLORS: Record<string, string> = {
  MALE: '#0ea5e9',
  FEMALE: '#ec4899',
}

const facultyChartConfig: ChartConfig = {
  count: { label: 'Applicants', color: '#10b981' },
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
  const { data: formAnalytics, isLoading } = useFormAnalyticsQuery()

  // All useMemo hooks BEFORE any early return (Rules of Hooks)
  const statusPieData = useMemo(() => {
    if (!formAnalytics?.byStatus) return []
    return Object.entries(formAnalytics.byStatus).map(([key, value]) => ({
      name: STATUS_LABELS[key] ?? key,
      value,
      color: STATUS_COLORS[key] ?? '#94a3b8',
    }))
  }, [formAnalytics?.byStatus])

  const facultyBarData = useMemo(() => {
    if (!formAnalytics?.byFaculty) return []
    return Object.entries(formAnalytics.byFaculty).map(([key, count]) => ({
      label: FACULTY_LABELS[key] ?? key,
      count,
    }))
  }, [formAnalytics?.byFaculty])

  const genderPieData = useMemo(() => {
    if (!formAnalytics?.byGender) return []
    return Object.entries(formAnalytics.byGender).map(([key, value]) => ({
      name: key === 'MALE' ? 'Male' : key === 'FEMALE' ? 'Female' : key,
      value,
      color: GENDER_COLORS[key] ?? '#94a3b8',
    }))
  }, [formAnalytics?.byGender])

  const untPeakBucket = useMemo(
    () =>
      (formAnalytics?.untScoreDistribution ?? []).reduce(
        (best, cur) => (cur.count > best.count ? cur : best),
        { range: '', count: 0 },
      ),
    [formAnalytics?.untScoreDistribution],
  )

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

  const totalApplicants = formAnalytics?.total ?? 0
  const avgEnglish = formAnalytics?.avgEnglishScore ?? 0
  const avgUnt = formAnalytics?.avgUntScore ?? 0
  const processedCount =
    (formAnalytics?.byStatus?.in_review ?? 0) + (formAnalytics?.byStatus?.reviewed ?? 0)

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
              {totalApplicants}
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
              {totalApplicants}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">All submissions</p>
          </div>

          {/* Avg English Score */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg English Score
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {avgEnglish.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">IELTS (out of 9)</p>
              </div>
              <div className="relative">
                <ProgressRing
                  value={avgEnglish}
                  max={9}
                  color={avgEnglish >= 6.5 ? '#10b981' : avgEnglish >= 5 ? '#f59e0b' : '#ef4444'}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: avgEnglish >= 6.5 ? '#10b981' : avgEnglish >= 5 ? '#f59e0b' : '#ef4444' }}
                >
                  {avgEnglish.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Avg UNT Score */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg UNT Score
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {Math.round(avgUnt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">out of 140</p>
              </div>
              <div className="relative">
                <ProgressRing
                  value={avgUnt}
                  max={140}
                  color={avgUnt >= 100 ? '#10b981' : avgUnt >= 70 ? '#f59e0b' : '#ef4444'}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: avgUnt >= 100 ? '#10b981' : avgUnt >= 70 ? '#f59e0b' : '#ef4444' }}
                >
                  {Math.round(avgUnt)}
                </span>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="group relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent">
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sky-400 to-sky-600" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Processed
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15">
                <CheckCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {processedCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">
              {formAnalytics?.byStatus?.in_review ?? 0} in review &middot;{' '}
              {formAnalytics?.byStatus?.reviewed ?? 0} reviewed
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* REAL DATA CHARTS (from formAnalytics)                           */}
        {/* ================================================================ */}

        {/* ---------------------------------------------------------------- */}
        {/* Row 1: UNT Score Distribution (full width)                      */}
        {/* ---------------------------------------------------------------- */}
        <SectionCard
          title="UNT Score Distribution"
          icon={TrendingUp}
          className="mb-6"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formAnalytics?.untScoreDistribution ?? []}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <EmeraldGradient id="untBarGradient" />
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
                  fill="url(#untBarGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={64}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {untPeakBucket.count > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground/50">
              Most candidates scored between{' '}
              <span className="font-medium text-muted-foreground">
                {untPeakBucket.range}
              </span>
            </p>
          )}
        </SectionCard>

        {/* ---------------------------------------------------------------- */}
        {/* Row 2: Application Status + Faculty Distribution                */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Application Status Donut */}
          <SectionCard title="Application Status" icon={Shield}>
            <div className="flex flex-col items-center">
              <div className="relative h-52 w-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {totalApplicants}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {statusPieData.map((entry) => (
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

          {/* Faculty Distribution */}
          <SectionCard title="Faculty Distribution" icon={Activity}>
            <ChartContainer config={facultyChartConfig} className="h-72 w-full">
              <BarChart
                data={facultyBarData}
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

        {/* ---------------------------------------------------------------- */}
        {/* Row 3: English Score Distribution + Gender Distribution          */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* English Score Distribution */}
          <SectionCard title="English Score Distribution" icon={TrendingUp}>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formAnalytics?.englishScoreDistribution ?? []}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <EmeraldGradient id="englishBarGradient" />
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
                    fill="url(#englishBarGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={64}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Gender Distribution */}
          <SectionCard title="Gender Distribution" icon={Users}>
            <div className="flex flex-col items-center">
              <div className="relative h-52 w-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {totalApplicants}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {genderPieData.map((entry) => (
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
        </div>

        {/* ================================================================ */}
        {/* ML SCORING SECTION (pending)                                    */}
        {/* TODO: Remove this banner and connect to ML scoring endpoint     */}
        {/* ================================================================ */}
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ML scoring is pending — additional analytics (merit breakdown, AI detection, review flags) will appear here once the scoring pipeline processes applications.
          </p>
        </div>
      </div>
    </div>
  )
}
