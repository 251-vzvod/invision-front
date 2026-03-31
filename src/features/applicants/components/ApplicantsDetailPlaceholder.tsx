'use client'

import gsap from 'gsap'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  HelpCircle,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { useApplicantProfileQuery, useApplicantsRankingQuery } from '../api'
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD } from '../constants'
import type {
  ApplicantProfile,
  CandidateDecision,
  FeatureSnapshot,
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

const FEATURE_SNAPSHOT_META: Record<keyof FeatureSnapshot, { label: string; description: string }> =
  {
    motivation_clarity: {
      label: 'Motivation Clarity',
      description: 'How clearly the applicant explains goals and intent.',
    },
    initiative: {
      label: 'Initiative',
      description: 'Signals of self-started actions and ownership.',
    },
    leadership_impact: {
      label: 'Leadership Impact',
      description: 'Evidence of influencing outcomes and people.',
    },
    growth_trajectory: {
      label: 'Growth Trajectory',
      description: 'Pattern of progress over time.',
    },
    resilience: {
      label: 'Resilience',
      description: 'Ability to recover, adapt, and keep momentum.',
    },
    program_fit: {
      label: 'Program Fit',
      description: 'Match between profile and chosen program.',
    },
    evidence_richness: {
      label: 'Evidence Richness',
      description: 'Density of concrete supporting details.',
    },
    specificity_score: {
      label: 'Specificity',
      description: 'How specific claims and examples are.',
    },
    evidence_count: {
      label: 'Evidence Count Signal',
      description: 'Relative amount of evidence across sections.',
    },
    consistency_score: {
      label: 'Consistency',
      description: 'How internally consistent the application is.',
    },
    completeness_score: {
      label: 'Completeness',
      description: 'Coverage of expected fields and content.',
    },
    genericness_score: {
      label: 'Genericness',
      description: 'Degree of generic language in responses.',
    },
    contradiction_flag: {
      label: 'Contradiction Flag',
      description: 'Potential contradictory statements detected.',
    },
    docs_count_score: {
      label: 'Documents Count',
      description: 'Number of documents provided relative to maximum.',
    },
    portfolio_links_score: {
      label: 'Portfolio Links',
      description: 'Quality and presence of portfolio or project links.',
    },
    has_video_presentation: {
      label: 'Video Presentation',
      description: 'Whether candidate submitted a video presentation.',
    },
    logical_source_groups_present: {
      label: 'Source Groups',
      description: 'Number of distinct logical source groups in submission.',
    },
    material_support_score: {
      label: 'Material Support',
      description: 'How well claims are supported by submitted materials.',
    },
    polished_but_empty_score: {
      label: 'Polished but Empty',
      description: 'Degree of polished language with little substantive content.',
    },
    cross_section_mismatch_score: {
      label: 'Cross-Section Mismatch',
      description: 'Inconsistency between different sections of the application.',
    },
    authenticity_risk_raw: {
      label: 'Authenticity Risk (Raw)',
      description: 'Raw authenticity risk score before normalization.',
    },
    ai_detector_probability: {
      label: 'AI Detection Probability',
      description: 'Probability that text was AI-generated.',
    },
    ai_detector_applicable: {
      label: 'AI Detector Applicable',
      description: 'Whether AI detection analysis was applicable.',
    },
    excluded_sensitive_fields_count: {
      label: 'Excluded Fields',
      description: 'Number of sensitive fields excluded from scoring.',
    },
  }

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value * 100))

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
      <span className="text-muted-foreground w-24 shrink-0 text-sm">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-100">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-foreground w-8 shrink-0 text-right text-sm font-medium">{value}</span>
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
        className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 py-2 text-sm transition-colors"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>{title}</span>
        {count !== undefined && (
          <span className="text-muted-foreground/60 text-xs">({count})</span>
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
    () => ({
      sortField: DEFAULT_SORT_FIELD,
      sortDirection: DEFAULT_SORT_DIRECTION,
    }),
    [],
  )

  const { data: profile, isLoading } = useApplicantProfileQuery(applicantId)
  const { data: rankedApplicants = [] } = useApplicantsRankingQuery(defaultSort)

  // Committee decision state (client-side session only)
  const [committeeDecision, setCommitteeDecision] = useState<CandidateDecision>(null)
  const [pendingDecision, setPendingDecision] = useState<NonNullable<CandidateDecision> | null>(null)

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
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading profile data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <p className="text-foreground text-lg font-semibold">Applicant not found</p>
            <p className="text-muted-foreground text-sm">No profile exists for id: {applicantId}</p>
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
    { metric: 'Potential', value: profile.merit_breakdown.potential },
    { metric: 'Motivation', value: profile.merit_breakdown.motivation },
    { metric: 'Leadership', value: profile.merit_breakdown.leadership_agency },
    { metric: 'Experience', value: profile.merit_breakdown.experience_skills },
    { metric: 'Trust', value: profile.merit_breakdown.trust_completeness },
  ]

  const radarConfig: ChartConfig = {
    value: { label: 'Score', color: '#a6d80a' },
  }

  const featureSnapshotEntries = Object.entries(profile.feature_snapshot) as Array<
    [keyof FeatureSnapshot, FeatureSnapshot[keyof FeatureSnapshot]]
  >

  const numericFeatureEntries = featureSnapshotEntries.filter(
    ([key, value]) =>
      typeof value === 'number' &&
      key !== 'logical_source_groups_present' &&
      key !== 'excluded_sensitive_fields_count',
  ) as Array<[keyof FeatureSnapshot, number]>

  const nonNumericFeatureEntries = featureSnapshotEntries.filter(
    ([key, value]) =>
      typeof value === 'boolean' ||
      key === 'logical_source_groups_present' ||
      key === 'excluded_sensitive_fields_count',
  )

  return (
    <div ref={rootRef} className="min-h-screen bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
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
            <Badge variant="outline" className="text-muted-foreground border-border text-xs">
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
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {profile.candidate_name ?? 'Unnamed Candidate'}
            </h1>
            {profile.program_name && (
              <p className="text-muted-foreground text-sm">{profile.program_name}</p>
            )}
            <p className="text-muted-foreground/60 text-xs">{profile.candidate_id}</p>
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
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-4">
            <span className="text-foreground text-3xl font-bold">{profile.confidence_score}</span>
            <span className="text-muted-foreground text-xs font-medium">Confidence</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-4">
            <span className="text-foreground text-3xl font-bold">{profile.authenticity_risk}</span>
            <span className="text-muted-foreground text-xs font-medium">Authenticity Risk</span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Committee Decision                                              */}
        {/* ---------------------------------------------------------------- */}
        <Card
          data-animate-detail-section
          className="border-border bg-white shadow-sm"
        >
          <CardContent className="space-y-4 px-4 py-4">
            <p className="text-lg font-semibold tracking-tight">Committee Decision</p>

            {/* Current decision display */}
            <div>
              {committeeDecision === null && (
                <p className="text-muted-foreground text-sm">No decision yet</p>
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
                className={cn(
                  'gap-1.5',
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
                className={cn(
                  'gap-1.5',
                  committeeDecision === 'shortlisted'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30 hover:bg-amber-600'
                    : 'bg-amber-500 text-white hover:bg-amber-600',
                )}
                onClick={() => {
                  if (committeeDecision === 'rejected') {
                    setPendingDecision('shortlisted')
                  } else {
                    setCommitteeDecision('shortlisted')
                  }
                }}
              >
                <Star className="size-4" />
                Shortlist
              </Button>
              <Button
                size="default"
                className={cn(
                  'gap-1.5',
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
                    setCommitteeDecision(pendingDecision)
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
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="px-4 py-4">
                <ChartContainer
                  config={radarConfig}
                  className="mx-auto aspect-square max-h-72 w-full"
                >
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="rgba(166,216,10,0.35)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
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
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="space-y-3 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide">Merit Breakdown</p>
                <MeritProgressBar label="Potential" value={profile.merit_breakdown.potential} />
                <MeritProgressBar label="Motivation" value={profile.merit_breakdown.motivation} />
                <MeritProgressBar label="Leadership" value={profile.merit_breakdown.leadership_agency} />
                <MeritProgressBar label="Experience" value={profile.merit_breakdown.experience_skills} />
                <MeritProgressBar label="Trust" value={profile.merit_breakdown.trust_completeness} />
              </CardContent>
            </Card>

            {/* AI Detection */}
            {profile.ai_detector.enabled && (
              <Card
                data-animate-detail-section
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Bot className="text-muted-foreground h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-wide">AI Detection</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground text-2xl font-bold">
                      {(profile.ai_detector.probability_ai_generated * 100).toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground text-xs">AI probability</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {profile.ai_detector.model}
                    </span>
                    {profile.ai_detector.applicable && (
                      <Badge variant="outline" className="text-xs">
                        Applicable
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Committee Cohorts */}
            {profile.committee_cohorts.length > 0 && (
              <Card
                data-animate-detail-section
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-wide">
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
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="space-y-4 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide">Assessment Summary</p>
                <p className="text-foreground/85 text-sm leading-relaxed">
                  {profile.explanation.summary}
                </p>
                {profile.suggested_follow_up_question && (
                  <div className="bg-primary/5 border-primary/20 flex gap-3 rounded-lg border p-3">
                    <MessageSquare className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-primary/80 mb-1">Suggested Follow-up</p>
                      <p className="text-foreground text-sm">
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
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="space-y-2 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide">Review Flags</p>
                {profile.review_flags.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No flags</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.review_flags.map((flag) => (
                      <Badge
                        key={flag}
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/5 text-amber-700 text-xs"
                      >
                        {REVIEW_FLAG_LABELS[flag]}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strengths & Gaps */}
            <Card
              data-animate-detail-section
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="px-4 py-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide">Top Strengths</p>
                    <ul className="space-y-1.5">
                      {profile.top_strengths.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="text-foreground/85">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Gaps */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide">Main Gaps</p>
                    <ul className="space-y-1.5">
                      {profile.main_gaps.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                          <span className="text-foreground/85">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Uncertainties */}
                {profile.uncertainties.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Uncertainties
                    </p>
                    <ul className="space-y-1.5">
                      {profile.uncertainties.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <HelpCircle className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What to Verify Manually */}
            {profile.what_to_verify_manually.length > 0 && (
              <Card
                data-animate-detail-section
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="text-muted-foreground h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-wide">
                      What to Verify Manually
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {profile.what_to_verify_manually.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <div className="border-border bg-muted mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border">
                          <CheckCircle2 className="text-muted-foreground/40 h-3 w-3" />
                        </div>
                        <span className="text-foreground/85">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Evidence Spans */}
            {profile.evidence_spans.length > 0 && (
              <Card
                data-animate-detail-section
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="space-y-3 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-wide">Evidence Spans</p>
                  {profile.evidence_spans.map((span) => (
                    <div
                      key={`${span.source}-${span.snippet.slice(0, 20)}`}
                      className="flex items-start gap-3"
                    >
                      <Badge
                        variant="outline"
                        className="mt-0.5 shrink-0 text-xs"
                      >
                        {formatMachineLabel(span.source)}
                      </Badge>
                      <blockquote className="text-foreground/75 border-l-2 border-gray-200 pl-3 text-sm italic">
                        {span.snippet}
                      </blockquote>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Feature Snapshot — collapsible */}
            <Card
              data-animate-detail-section
              className="border-border bg-white shadow-sm"
            >
              <CardContent className="px-4 py-4">
                <CollapsibleSection
                  title={`Show detailed signals (${featureSnapshotEntries.length})`}
                >
                  <div className="space-y-4">
                    {/* Numeric features as 2-col progress bars */}
                    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {numericFeatureEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-muted-foreground w-36 shrink-0 truncate text-xs">
                            {FEATURE_SNAPSHOT_META[key].label}
                          </span>
                          <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${clampPercent(value)}%` }}
                            />
                          </div>
                          <span className="text-foreground w-10 shrink-0 text-right text-xs font-medium">
                            {clampPercent(value).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Boolean / count features */}
                    {nonNumericFeatureEntries.length > 0 && (
                      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                        {nonNumericFeatureEntries.map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs">
                              {FEATURE_SNAPSHOT_META[key].label}:
                            </span>
                            {typeof value === 'boolean' ? (
                              <Badge variant={value ? 'secondary' : 'outline'} className="text-xs">
                                {value ? 'Yes' : 'No'}
                              </Badge>
                            ) : (
                              <span className="text-foreground text-xs font-medium">
                                {String(value)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>

            {/* Scoring Notes — collapsible */}
            {Object.keys(profile.explanation.scoring_notes).length > 0 && (
              <Card
                data-animate-detail-section
                className="border-border bg-white shadow-sm"
              >
                <CardContent className="px-4 py-4">
                  <CollapsibleSection title="Scoring Notes">
                    <dl className="space-y-2">
                      {Object.entries(profile.explanation.scoring_notes).map(([key, note]) => (
                        <div key={key}>
                          <dt className="text-foreground text-sm font-medium capitalize">{key}</dt>
                          <dd className="text-muted-foreground text-sm">{note}</dd>
                        </div>
                      ))}
                    </dl>
                  </CollapsibleSection>
                </CardContent>
              </Card>
            )}

            {/* Authenticity Review Reasons */}
            {profile.authenticity_review_reasons.length > 0 && (
              <Card
                data-animate-detail-section
                className="border-amber-500/30 bg-amber-50/50 shadow-sm"
              >
                <CardContent className="space-y-2 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                      Authenticity Review
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {profile.authenticity_review_reasons.map((reason) => (
                      <li key={reason} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span className="text-amber-900/80">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
