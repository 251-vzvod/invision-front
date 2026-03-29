'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { useApplicantProfileQuery, useApplicantsRankingQuery } from '../api'
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD } from '../constants'
import type { ApplicantProfile, FeatureSnapshot, Recommendation, ReviewFlag } from '../types'

const ELIGIBILITY_STATUS_META: Record<
  ApplicantProfile['eligibility_status'],
  { label: string; description: string; badgeClassName: string }
> = {
  invalid: {
    label: 'Invalid',
    description: 'Missing candidate id, no usable content, or consent is false.',
    badgeClassName: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  incomplete_application: {
    label: 'Incomplete Application',
    description: 'Not enough text content for meaningful scoring.',
    badgeClassName: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  },
  conditionally_eligible: {
    label: 'Conditionally Eligible',
    description: 'Scoreable, but requires extra checks or missingness follow-up.',
    badgeClassName: 'border-sky-600/35 bg-sky-600/10 text-sky-800',
  },
  eligible: {
    label: 'Eligible',
    description: 'All key sections are present for standard evaluation.',
    badgeClassName: 'border-emerald-600/35 bg-emerald-600/10 text-emerald-800',
  },
}

const ELIGIBILITY_REASON_LABELS: Record<string, string> = {
  missing_required_materials_documents: 'Missing required documents',
  missing_required_materials_portfolio: 'Missing required portfolio',
  missing_required_materials_video: 'Missing required video',
}

const RECOMMENDATION_META: Record<
  Recommendation,
  { label: string; description: string; badgeClassName: string }
> = {
  invalid: {
    label: 'Invalid',
    description: 'Application cannot proceed to normal review.',
    badgeClassName: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  incomplete_application: {
    label: 'Incomplete Application',
    description: 'There is not enough structured content for full review.',
    badgeClassName: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  },
  insufficient_evidence: {
    label: 'Insufficient Evidence',
    description: 'Claims need stronger supporting evidence before confident decisioning.',
    badgeClassName: 'border-orange-500/40 bg-orange-500/10 text-orange-700',
  },
  review_priority: {
    label: 'Review Priority',
    description: 'Escalated candidate for prioritized manager attention.',
    badgeClassName: 'border-sky-600/35 bg-sky-600/10 text-sky-800',
  },
  manual_review_required: {
    label: 'Manual Review Required',
    description: 'Decision should be made by manager after manual verification.',
    badgeClassName: 'border-violet-600/35 bg-violet-600/10 text-violet-800',
  },
  standard_review: {
    label: 'Standard Review',
    description: 'Candidate can be processed in standard admission flow.',
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
  }

const formatMachineLabel = (value: string): string =>
  value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')

const formatEligibilityReason = (reason: string): string =>
  ELIGIBILITY_REASON_LABELS[reason] ?? formatMachineLabel(reason)

const formatScoreValue = (value: number): string => value.toFixed(0)

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value * 100))

interface ScoreBubbleCardProps {
  label: string
  value: number
  hint: string
}

function ScoreBubbleCard({ label, value, hint }: ScoreBubbleCardProps) {
  return (
    <Card size="sm" className="border-primary/20 bg-background/95 shadow-sm">
      <CardContent className="flex flex-col items-center gap-2 px-4 py-4 text-center">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div className="border-primary/30 bg-primary/10 text-foreground flex h-24 w-24 items-center justify-center rounded-full border-2 text-2xl font-semibold">
          {formatScoreValue(value)}
        </div>
        <p className="text-foreground/80 text-sm">{hint}</p>
      </CardContent>
    </Card>
  )
}

interface ApplicantsDetailProps {
  applicantId: string
}

export function ApplicantsDetail({ applicantId }: ApplicantsDetailProps) {
  const defaultSort = useMemo(
    () => ({
      sortField: DEFAULT_SORT_FIELD,
      sortDirection: DEFAULT_SORT_DIRECTION,
    }),
    [],
  )

  const { data: profile, isLoading } = useApplicantProfileQuery(applicantId)
  const { data: rankedApplicants = [] } = useApplicantsRankingQuery(defaultSort)

  const rank =
    rankedApplicants.findIndex((candidate) => candidate.candidate_id === applicantId) + 1 || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Applicant profile</CardTitle>
              <CardDescription>Loading profile data...</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Applicant not found</CardTitle>
              <CardDescription>No profile exists for id: {applicantId}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/applicants">Back to applicants</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const scoreCards = [
    {
      label: 'Merit Score',
      value: profile.merit_score,
      hint: 'Overall candidate merit based on all evaluated signals.',
    },
    {
      label: 'Confidence Score',
      value: profile.confidence_score,
      hint: 'How reliable and evidence-backed the generated assessment is.',
    },
    {
      label: 'Authenticity Risk',
      value: profile.authenticity_risk,
      hint: 'Lower is better. High values suggest stronger authenticity concerns.',
    },
  ]

  const meritCards = [
    {
      label: 'Potential',
      value: profile.merit_breakdown.potential,
      hint: 'Future growth capacity and learning acceleration.',
    },
    {
      label: 'Motivation',
      value: profile.merit_breakdown.motivation,
      hint: 'Strength and clarity of personal academic intent.',
    },
    {
      label: 'Leadership',
      value: profile.merit_breakdown.leadership_agency,
      hint: 'Ownership, initiative, and impact on others.',
    },
    {
      label: 'Experience',
      value: profile.merit_breakdown.experience_skills,
      hint: 'Practical skill depth and relevant execution history.',
    },
    {
      label: 'Trust',
      value: profile.merit_breakdown.trust_completeness,
      hint: 'Submission consistency, completeness, and credibility.',
    },
  ]

  const radarData = [
    { metric: 'Potential', value: profile.merit_breakdown.potential },
    { metric: 'Motivation', value: profile.merit_breakdown.motivation },
    { metric: 'Leadership', value: profile.merit_breakdown.leadership_agency },
    { metric: 'Experience', value: profile.merit_breakdown.experience_skills },
    { metric: 'Trust', value: profile.merit_breakdown.trust_completeness },
  ]

  const radarConfig: ChartConfig = {
    value: {
      label: 'Score',
      color: '#a6d80a',
    },
  }

  const featureSnapshotEntries = Object.entries(profile.feature_snapshot) as Array<
    [keyof FeatureSnapshot, FeatureSnapshot[keyof FeatureSnapshot]]
  >
  const eligibilityMeta = ELIGIBILITY_STATUS_META[profile.eligibility_status]
  const recommendationMeta = RECOMMENDATION_META[profile.recommendation]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_15%,rgba(166,216,10,0.2)_0%,transparent_36%),radial-gradient(circle_at_90%_5%,rgba(193,241,29,0.15)_0%,transparent_36%),linear-gradient(180deg,#f8fafc_0%,#f3f8df_100%)]">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/applicants">Back to applicants</Link>
          </Button>
          {rank ? <p className="text-muted-foreground text-base">Current rank: #{rank}</p> : null}
        </div>

        <Card className="border-primary/20 bg-background/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Applicant profile</CardTitle>
            <CardDescription>
              Candidate id: {profile.candidate_id} • Scoring run: {profile.scoring_run_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-foreground/85 space-y-2 text-base">
            <p>
              <span className="text-foreground font-semibold">Name:</span> {profile.candidate_name}
            </p>
            <p>
              <span className="text-foreground font-semibold">Program:</span> {profile.program_name}
            </p>
            <p>
              <span className="text-foreground font-semibold">Eligibility:</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={eligibilityMeta.badgeClassName}>{eligibilityMeta.label}</Badge>
              <span className="text-muted-foreground text-sm">{eligibilityMeta.description}</span>
            </div>
            <p>
              <span className="text-foreground font-semibold">Recommendation:</span>{' '}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={recommendationMeta.badgeClassName}>
                {recommendationMeta.label}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {recommendationMeta.description}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {scoreCards.map((metric) => (
            <ScoreBubbleCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
            />
          ))}
        </div>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Merit radar</CardTitle>
            <CardDescription>Visual comparison of the five key parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-90 w-full">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(166,216,10,0.35)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#415710', fontSize: 14 }} />
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

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Merit breakdown</CardTitle>
            <CardDescription>Potential, Motivation, Leadership, Experience, Trust</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {meritCards.map((metric) => (
              <ScoreBubbleCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Review flags and eligibility reasons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-foreground mb-2 text-base font-medium">Review flags</p>
              {profile.review_flags.length === 0 ? (
                <p className="text-muted-foreground text-base">No flags</p>
              ) : (
                <ul className="text-foreground/85 list-inside list-disc space-y-1 text-base">
                  {profile.review_flags.map((flag) => (
                    <li key={flag}>{REVIEW_FLAG_LABELS[flag]}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-foreground mb-2 text-base font-medium">Eligibility reasons</p>
              {profile.eligibility_reasons.length === 0 ? (
                <p className="text-muted-foreground text-base">No eligibility blockers</p>
              ) : (
                <ul className="text-foreground/85 list-inside list-disc space-y-1 text-base">
                  {profile.eligibility_reasons.map((reason) => (
                    <li key={reason}>{formatEligibilityReason(reason)}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Top strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-foreground/85 list-inside list-disc space-y-1 text-base">
              {profile.top_strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Main gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-foreground/85 list-inside list-disc space-y-1 text-base">
              {profile.main_gaps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Uncertainties</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-foreground/85 list-inside list-disc space-y-1 text-base">
              {profile.uncertainties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Evidence spans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.evidence_spans.map((span) => (
              <Card
                key={`${span.dimension}-${span.source}-${span.text.slice(0, 20)}`}
                size="sm"
                className="border-primary/20 bg-primary/5"
              >
                <CardHeader>
                  <CardDescription>
                    {span.dimension} • {span.source}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/85 text-base">{span.text}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Feature snapshot</CardTitle>
            <CardDescription>
              Human-readable quality signals derived from application content
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-base sm:grid-cols-2 lg:grid-cols-3">
            {featureSnapshotEntries.map(([key, value]) => (
              <Card key={key} size="sm" className="border-primary/20 bg-primary/5 py-0">
                <CardContent className="space-y-2 py-4">
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {FEATURE_SNAPSHOT_META[key].label}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {FEATURE_SNAPSHOT_META[key].description}
                    </p>
                  </div>

                  {typeof value === 'number' ? (
                    <div className="space-y-1">
                      <p className="text-foreground/85 text-sm font-medium">
                        {clampPercent(value).toFixed(0)}%
                      </p>
                      <div className="bg-primary/20 h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${clampPercent(value)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Badge variant={value ? 'secondary' : 'outline'}>
                      {value ? 'Detected' : 'Not detected'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/85 space-y-3 text-base">
            <p>{profile.explanation.summary}</p>
            <div>
              <p className="text-foreground mb-2 font-medium">Scoring notes</p>
              <ul className="list-inside list-disc space-y-1">
                {Object.entries(profile.explanation.scoring_notes).map(([key, note]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {note}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
