'use client'

import gsap from 'gsap'
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  MessageSquare,
  Star,
  Users,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { cn } from '@/shared/lib/utils'
import { runPageIntroAnimation } from '@/shared/lib/gsap-animations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { useApplicantProfileQuery, useApplicantsRankingQuery, useSetDecisionMutation } from '../api'
import { DEFAULT_QUERY_PARAMS } from '../constants'
import type {
  AIDetectorTextSource,
  ApplicantProfile,
  CandidateDecision,
  Recommendation,
  ReviewFlag,
} from '../types'

/* -------------------------------------------------------------------------- */
/*  Meta constants                                                            */
/* -------------------------------------------------------------------------- */

const ELIGIBILITY_STATUS_META: Record<
  ApplicantProfile['eligibility_status'],
  { label: string; badgeClassName: string }
> = {
  invalid: {
    label: 'Invalid',
    badgeClassName: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  incomplete_application: {
    label: 'Incomplete',
    badgeClassName: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  },
  conditionally_eligible: {
    label: 'Conditionally Eligible',
    badgeClassName: 'border-sky-600/35 bg-sky-600/10 text-sky-800',
  },
  eligible: {
    label: 'Eligible',
    badgeClassName: 'border-emerald-600/35 bg-emerald-600/10 text-emerald-800',
  },
}

const RECOMMENDATION_META: Record<
  Recommendation,
  { label: string; badgeClassName: string }
> = {
  invalid: {
    label: 'Invalid',
    badgeClassName: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  incomplete_application: {
    label: 'Incomplete Application',
    badgeClassName: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  },
  insufficient_evidence: {
    label: 'Insufficient Evidence',
    badgeClassName: 'border-orange-500/40 bg-orange-500/10 text-orange-700',
  },
  review_priority: {
    label: 'Review Priority',
    badgeClassName: 'border-sky-600/35 bg-sky-600/10 text-sky-800',
  },
  manual_review_required: {
    label: 'Manual Review Required',
    badgeClassName: 'border-violet-600/35 bg-violet-600/10 text-violet-800',
  },
  standard_review: {
    label: 'Standard Review',
    badgeClassName: 'border-emerald-600/35 bg-emerald-600/10 text-emerald-800',
  },
}

const REVIEW_FLAG_LABELS: Record<ReviewFlag, string> = {
  eligibility_gate: 'Eligibility gate',
  low_confidence: 'Low confidence',
  insufficient_evidence: 'Insufficient evidence',
  low_evidence_density: 'Low evidence density',
  moderate_authenticity_risk: 'Moderate authenticity risk',
  high_authenticity_risk: 'High authenticity risk',
  contradiction_risk: 'Contradiction risk',
  possible_contradiction: 'Possible contradiction',
  polished_but_empty_pattern: 'Polished but empty pattern',
  high_polished_but_empty: 'High polished but empty',
  high_genericness: 'High genericness',
  cross_section_mismatch: 'Cross-section mismatch',
  section_mismatch: 'Section mismatch',
  missing_required_materials: 'Missing required materials',
  auxiliary_ai_generation_signal: 'Auxiliary AI generation signal',
}


/* -------------------------------------------------------------------------- */
/*  AI Detection helpers                                                      */
/* -------------------------------------------------------------------------- */

type AIRiskLevel = 'safe' | 'caution' | 'high'

function getAIRiskLevel(prob: number): AIRiskLevel {
  if (prob < 0.25) return 'safe'
  if (prob <= 0.55) return 'caution'
  return 'high'
}

const AI_RISK_STYLES: Record<
  AIRiskLevel,
  {
    cardBorder: string
    cardBg: string
    badgeBg: string
    badgeText: string
    barBg: string
    label: string
    icon: string
    accentBorder: string
  }
> = {
  safe: {
    cardBorder: 'border-emerald-200 dark:border-emerald-500/30',
    cardBg: 'bg-emerald-50/40 dark:bg-emerald-500/5',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    barBg: 'bg-emerald-500',
    label: 'Low Risk',
    icon: '\u2713',
    accentBorder: 'border-l-emerald-500',
  },
  caution: {
    cardBorder: 'border-amber-200 dark:border-amber-500/30',
    cardBg: 'bg-amber-50/40 dark:bg-amber-500/5',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-400',
    barBg: 'bg-amber-500',
    label: 'Moderate Risk',
    icon: '!',
    accentBorder: 'border-l-amber-500',
  },
  high: {
    cardBorder: 'border-red-200 dark:border-red-500/30',
    cardBg: 'bg-red-50/40 dark:bg-red-500/5',
    badgeBg: 'bg-red-100 dark:bg-red-500/20',
    badgeText: 'text-red-700 dark:text-red-400',
    barBg: 'bg-red-500',
    label: 'High Risk',
    icon: '\u2717',
    accentBorder: 'border-l-red-500',
  },
}

const AI_SOURCE_LABELS: Record<string, string> = {
  motivation_letter_text: 'Motivation Letter',
  interview_text: 'Interview',
  video_interview_transcript_text: 'Video Interview',
  video_presentation_transcript_text: 'Video Presentation',
}

function AISourceRow({ source }: { source: AIDetectorTextSource }) {
  const prob = source.probability_ai_generated
  const riskLevel = prob != null ? getAIRiskLevel(prob) : null
  const styles = riskLevel ? AI_RISK_STYLES[riskLevel] : null
  const label = source.question ?? AI_SOURCE_LABELS[source.source_key] ?? source.source_label
  const pct = prob != null ? Math.round(prob * 100) : null

  return (
    <div className="flex gap-2">
      <div className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', styles?.barBg ?? 'bg-muted-foreground/30')} />
      <span className="flex-1 text-xs leading-relaxed text-foreground/75">{label}</span>
      <span className={cn('shrink-0 self-start text-xs font-semibold tabular-nums', styles?.badgeText ?? 'text-muted-foreground')}>
        {pct != null ? `${pct}%` : '—'}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatMachineLabel = (value: string): string =>
  value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function MeritProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>{title}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground/50">({count})</span>
        )}
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

interface ApplicantsDetailProps {
  applicantId: string
}

export function ApplicantsDetail({ applicantId }: ApplicantsDetailProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const defaultSort = useMemo(
    () => DEFAULT_QUERY_PARAMS,
    [],
  )

  const { data: profile, isLoading } = useApplicantProfileQuery(applicantId)
  const { data: rankingData } = useApplicantsRankingQuery(defaultSort)
  const rankedApplicants = rankingData?.items ?? []

  // Committee decision state — initialised from API, optimistically updated on action
  const [committeeDecision, setCommitteeDecision] = useState<CandidateDecision>(null)
  const [pendingDecision, setPendingDecision] = useState<NonNullable<CandidateDecision> | null>(null)
  const { mutate: setDecision, isPending: isDecisionPending } = useSetDecisionMutation()

  // Sync decision from API whenever profile loads/refetches
  useEffect(() => {
    if (!profile) return
    const d = profile.decision
    setCommitteeDecision(!d || d === 'no_decision' ? null : d)
  }, [profile?.decision])

  useEffect(() => {
    const root = rootRef.current

    if (!root || !profile) {
      return
    }

    const context = gsap.context(() => {
      runPageIntroAnimation(root, {
        sectionSelector: '[data-animate-detail-section]',
        itemSelector: '[data-animate-detail-item]',
        sectionDuration: 0.72,
        itemDuration: 0.62,
      })
    }, root)

    return () => {
      context.revert()
    }
  }, [profile])

  const rank =
    rankedApplicants.findIndex((candidate) => candidate.candidate_id === applicantId) + 1 || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard">
        <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button */}
          <Skeleton className="h-9 w-20 rounded-md" />

          {/* Header: name + program + badges */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          {/* Score strip */}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl px-4 py-4"
              >
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>

          {/* Committee Decision skeleton */}
          <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
            <CardContent className="space-y-4 px-4 py-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            </CardContent>
          </Card>

          {/* Two-column layout */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Left column */}
            <div className="space-y-4">
              {/* Radar chart */}
              <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
                <CardContent className="px-4 py-4">
                  <Skeleton className="mx-auto aspect-square max-h-72 w-full rounded-xl" />
                </CardContent>
              </Card>

              {/* Merit breakdown bars */}
              <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
                <CardContent className="space-y-3 px-4 py-4">
                  <Skeleton className="h-4 w-36" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Assessment Summary */}
              <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
                <CardContent className="space-y-4 px-4 py-4">
                  <Skeleton className="h-4 w-44" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-lg" />
                </CardContent>
              </Card>

              {/* Review Flags */}
              <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
                <CardContent className="space-y-2 px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Gaps */}
              <Card className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none">
                <CardContent className="px-4 py-4">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Strengths */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                    {/* Gaps */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dashboard">
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-foreground">Applicant not found</p>
            <p className="text-sm text-muted-foreground">No profile exists for id: {applicantId}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/applicants">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to applicants
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const eligibilityMeta = ELIGIBILITY_STATUS_META[profile.eligibility_status]
  const recommendationMeta = RECOMMENDATION_META[profile.recommendation]

  const radarData = [
    { metric: 'Hidden Potential', value: profile.hidden_potential_score },
    { metric: 'Support Needed', value: profile.support_needed_score },
    { metric: 'Shortlist Priority', value: profile.shortlist_priority_score },
    { metric: 'Evidence Coverage', value: profile.evidence_coverage_score },
    { metric: 'Trajectory', value: profile.trajectory_score },
  ]

  const radarConfig: ChartConfig = {
    value: { label: 'Score', color: '#a6d80a' },
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-dashboard">
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/*  Top bar: Back + Rank                                            */}
        {/* ---------------------------------------------------------------- */}
        <div
          data-animate-detail-section
          className="flex items-center gap-3"
        >
          <Button asChild variant="outline" size="sm">
            <Link href="/applicants">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
          {rank && (
            <Badge variant="outline" className="border-border dark:border-white/10 text-xs text-muted-foreground">
              Rank #{rank}
            </Badge>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Header: Name + Program + Badges                                 */}
        {/* ---------------------------------------------------------------- */}
        <div
          data-animate-detail-section
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {profile.candidate_name ?? 'Unnamed Candidate'}
            </h1>
            {profile.program_name && (
              <p className="text-sm text-muted-foreground">{profile.program_name}</p>
            )}
            <p className="text-xs text-muted-foreground/50">{profile.candidate_id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={eligibilityMeta.badgeClassName}>{eligibilityMeta.label}</Badge>
            <Badge className={recommendationMeta.badgeClassName}>
              {recommendationMeta.label}
            </Badge>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Score strip                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div
          data-animate-detail-section
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-primary/10 border-primary/20 flex flex-col items-center gap-1 rounded-xl border px-4 py-4">
            <span className="text-primary text-3xl font-bold">{profile.merit_score}</span>
            <span className="text-primary/80 text-xs font-medium">Merit Score</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl px-4 py-4">
            <span className="text-3xl font-bold text-foreground">{profile.confidence_score}</span>
            <span className="text-xs font-medium text-muted-foreground">Confidence</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl px-4 py-4">
            <span className="text-3xl font-bold text-foreground">{profile.authenticity_risk}</span>
            <span className="text-xs font-medium text-muted-foreground">Authenticity Risk</span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Committee Decision                                              */}
        {/* ---------------------------------------------------------------- */}
        <Card
          data-animate-detail-section
          className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
        >
          <CardContent className="space-y-4 px-4 py-4">
            <p className="text-lg font-semibold tracking-tight text-foreground">Committee Decision</p>

            {/* Current decision display */}
            <div>
              {committeeDecision === null && (
                <p className="text-sm text-muted-foreground">No decision yet</p>
              )}
              {committeeDecision === 'approved' && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-xl font-bold uppercase tracking-wide">Approved</span>
                </div>
              )}
              {committeeDecision === 'shortlisted' && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Star className="h-6 w-6" />
                  <span className="text-xl font-bold uppercase tracking-wide">Shortlisted</span>
                </div>
              )}
              {committeeDecision === 'rejected' && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-6 w-6" />
                  <span className="text-xl font-bold uppercase tracking-wide">Rejected</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="default"
                disabled={isDecisionPending}
                className={cn(
                  'gap-1.5 active:scale-[0.97] transition-transform duration-100',
                  committeeDecision === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 hover:bg-emerald-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700',
                )}
                onClick={() => setPendingDecision('approved')}
              >
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
              <Button
                size="default"
                disabled={isDecisionPending}
                className={cn(
                  'gap-1.5 active:scale-[0.97] transition-transform duration-100',
                  committeeDecision === 'shortlisted'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30 hover:bg-amber-600'
                    : 'bg-amber-500 text-white hover:bg-amber-600',
                )}
                onClick={() => {
                  if (committeeDecision === 'rejected') {
                    setPendingDecision('shortlisted')
                  } else {
                    setDecision(
                      { candidateId: applicantId, decision: 'shortlisted' },
                      { onSuccess: () => setCommitteeDecision('shortlisted') },
                    )
                  }
                }}
              >
                <Star className="size-4" />
                Shortlist
              </Button>
              <Button
                size="default"
                disabled={isDecisionPending}
                className={cn(
                  'gap-1.5 active:scale-[0.97] transition-transform duration-100',
                  committeeDecision === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30 hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700',
                )}
                onClick={() => setPendingDecision('rejected')}
              >
                <XCircle className="size-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation dialog */}
        <AlertDialog
          open={pendingDecision !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDecision(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingDecision === 'approved' && 'Approve candidate?'}
                {pendingDecision === 'rejected' && 'Reject candidate?'}
                {pendingDecision === 'shortlisted' && 'Move to shortlist?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDecision === 'approved' &&
                  'Are you sure you want to approve this candidate? This marks them as approved for admission.'}
                {pendingDecision === 'rejected' &&
                  'Are you sure you want to reject this candidate? This marks them as rejected for the committee review.'}
                {pendingDecision === 'shortlisted' &&
                  'This candidate is currently rejected. Are you sure you want to move them to shortlist?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(
                  pendingDecision === 'approved' && 'bg-emerald-600 hover:bg-emerald-700',
                  pendingDecision === 'rejected' && 'bg-red-600 hover:bg-red-700',
                  pendingDecision === 'shortlisted' && 'bg-amber-500 hover:bg-amber-600',
                )}
                onClick={() => {
                  if (pendingDecision) {
                    const decision = pendingDecision
                    setDecision(
                      { candidateId: applicantId, decision },
                      { onSuccess: () => setCommitteeDecision(decision) },
                    )
                  }
                  setPendingDecision(null)
                }}
              >
                {pendingDecision === 'approved' && 'Approve'}
                {pendingDecision === 'rejected' && 'Reject'}
                {pendingDecision === 'shortlisted' && 'Move to Shortlist'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ---------------------------------------------------------------- */}
        {/*  Two-column layout                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* ============================================================== */}
          {/*  LEFT COLUMN (sticky)                                          */}
          {/* ============================================================== */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {/* Radar chart */}
            <Card
              data-animate-detail-section
              className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
            >
              <CardContent className="px-4 py-4">
                <ChartContainer
                  config={radarConfig}
                  className="mx-auto aspect-square max-h-72 w-full"
                >
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="rgba(166,216,10,0.35)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
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
              </CardContent>
            </Card>

            {/* Merit breakdown progress bars */}
            <Card
              data-animate-detail-section
              className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
            >
              <CardContent className="space-y-3 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Score Breakdown</p>
                <MeritProgressBar label="Hidden Potential" value={profile.hidden_potential_score} />
                <MeritProgressBar label="Support Needed" value={profile.support_needed_score} />
                <MeritProgressBar label="Shortlist Priority" value={profile.shortlist_priority_score} />
                <MeritProgressBar label="Evidence Coverage" value={profile.evidence_coverage_score} />
                <MeritProgressBar label="Trajectory" value={profile.trajectory_score} />
              </CardContent>
            </Card>

            {/* Committee Cohorts */}
            {(profile.committee_cohorts?.length ?? 0) > 0 && (
              <Card
                data-animate-detail-section
                className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                      Committee Cohorts
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.committee_cohorts.map((cohort) => (
                      <Badge
                        key={cohort}
                        variant="secondary"
                        className="text-xs"
                      >
                        {cohort}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============================================================== */}
          {/*  RIGHT COLUMN                                                  */}
          {/* ============================================================== */}
          <div className="space-y-4">
            {/* Assessment Summary */}
            <Card
              data-animate-detail-section
              className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
            >
              <CardContent className="space-y-4 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Assessment Summary</p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {profile.explanation.summary}
                </p>
                {profile.suggested_follow_up_question && (
                  <div className="bg-primary/5 border-primary/20 flex gap-3 rounded-lg border p-3">
                    <MessageSquare className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-primary/80 mb-1">Suggested Follow-up</p>
                      <p className="text-sm text-foreground">
                        {profile.suggested_follow_up_question}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Flags */}
            <Card
              data-animate-detail-section
              className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
            >
              <CardContent className="space-y-2 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Review Flags</p>
                {(profile.review_flags?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No flags</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.review_flags.map((flag) => (
                      <Badge
                        key={flag}
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 text-xs"
                      >
                        {REVIEW_FLAG_LABELS[flag]}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Detection */}
            {(profile.ai_probability_ai_generated != null || profile.text_ai_probabilities != null) && (() => {
              const overallProb = profile.ai_probability_ai_generated
              const hasOverall = overallProb != null
              const riskLevel = hasOverall ? getAIRiskLevel(overallProb) : null
              const styles = riskLevel ? AI_RISK_STYLES[riskLevel] : null
              const textProbs = profile.text_ai_probabilities

              // Collect applicable sources for per-source breakdown
              const applicableSources: AIDetectorTextSource[] = []
              if (textProbs) {
                const singleKeys = [
                  'motivation_letter_text',
                  'interview_text',
                  'video_interview_transcript_text',
                  'video_presentation_transcript_text',
                ] as const
                for (const key of singleKeys) {
                  const src = textProbs[key]
                  if (src?.applicable) applicableSources.push(src)
                }
                if (textProbs.motivation_questions) {
                  for (const q of textProbs.motivation_questions) {
                    if (q.applicable) applicableSources.push(q)
                  }
                }
              }

              return (
                <Card
                  data-animate-detail-section
                  className={cn(
                    'border-l-4 shadow-none',
                    styles
                      ? cn(styles.cardBorder, styles.cardBg, styles.accentBorder)
                      : 'border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl border-l-muted-foreground/30',
                  )}
                >
                  <CardContent className="space-y-4 px-4 py-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold uppercase tracking-wide text-foreground">AI Detection</p>
                    </div>

                    {hasOverall && styles ? (
                      <div className="space-y-4">
                        {/* Score + label */}
                        <div className="flex items-end gap-3">
                          <span className={cn('text-4xl font-black tabular-nums leading-none', styles.badgeText)}>
                            {Math.round(overallProb * 100)}%
                          </span>
                          <div className="mb-0.5 space-y-0.5">
                            <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', styles.badgeBg, styles.badgeText)}>
                              {styles.label}
                            </span>
                            <p className="text-xs text-muted-foreground">probability of AI-generated content</p>
                          </div>
                        </div>

                        {/* Segmented risk bar with needle */}
                        <div className="space-y-1.5">
                          <div className="relative h-2.5 w-full overflow-hidden rounded-full">
                            <div className="absolute inset-0 flex">
                              <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
                              <div className="h-full bg-amber-400" style={{ width: '30%' }} />
                              <div className="h-full bg-red-500" style={{ width: '45%' }} />
                            </div>
                          </div>
                          {/* Needle indicator — outside overflow:hidden */}
                          <div className="relative h-1 w-full">
                            <div
                              className={cn('absolute -top-4 h-4 w-0.5 rounded-full', styles.barBg)}
                              style={{ left: `clamp(1px, calc(${Math.round(overallProb * 100)}% - 1px), calc(100% - 2px))` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Safe</span>
                            <span>Caution</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">AI detection data not available</p>
                    )}

                    {/* Source breakdown */}
                    {applicableSources.length > 0 && (
                      <div className="space-y-2.5 border-t border-border/50 dark:border-white/10 pt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source Breakdown</p>
                        {applicableSources.map((src, idx) => (
                          <AISourceRow key={`${src.source_key}-${idx}`} source={src} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Strengths & Gaps */}
            <Card
              data-animate-detail-section
              className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
            >
              <CardContent className="px-4 py-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Top Strengths</p>
                    <ul className="space-y-1.5">
                      {profile.top_strengths.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="text-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Gaps */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Main Gaps</p>
                    <ul className="space-y-1.5">
                      {profile.main_gaps.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                          <span className="text-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* What to Verify Manually */}
            {(profile.what_to_verify_manually?.length ?? 0) > 0 && (
              <Card
                data-animate-detail-section
                className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                      What to Verify Manually
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {profile.what_to_verify_manually.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl">
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground/50" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Evidence Highlights */}
            {(profile.evidence_highlights?.length ?? 0) > 0 && (
              <Card
                data-animate-detail-section
                className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
              >
                <CardContent className="space-y-3 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Evidence Highlights</p>
                  </div>
                  {profile.evidence_highlights.map((highlight) => (
                    <div
                      key={`${highlight.source}-${highlight.claim.slice(0, 30)}`}
                      className="space-y-1.5 rounded-lg border border-border dark:border-white/10 bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {formatMachineLabel(highlight.source)}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-xs"
                        >
                          {formatMachineLabel(highlight.support_level)}
                        </Badge>
                        <span className="ml-auto text-xs font-medium text-muted-foreground">
                          {highlight.support_score}/10
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{highlight.claim}</p>
                      <blockquote className="border-l-2 border-border dark:border-white/10 pl-3 text-sm italic text-muted-foreground">
                        {highlight.snippet}
                      </blockquote>
                      {highlight.rationale && (
                        <p className="text-xs text-muted-foreground">{highlight.rationale}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Scoring Notes — collapsible */}
            {Object.keys(profile.explanation.scoring_notes).length > 0 && (
              <Card
                data-animate-detail-section
                className="border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl shadow-none"
              >
                <CardContent className="px-4 py-4">
                  <CollapsibleSection title="Scoring Notes">
                    <dl className="space-y-2">
                      {Object.entries(profile.explanation.scoring_notes).map(([key, note]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium capitalize text-foreground">{key}</dt>
                          <dd className="text-sm text-muted-foreground">{note}</dd>
                        </div>
                      ))}
                    </dl>
                  </CollapsibleSection>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
