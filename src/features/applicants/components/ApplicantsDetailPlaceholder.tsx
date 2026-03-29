'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
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
    { label: 'Merit score', value: profile.merit_score },
    { label: 'Confidence score', value: profile.confidence_score },
    { label: 'Authenticity risk', value: profile.authenticity_risk },
  ]

  const meritCards = [
    { label: 'Potential', value: profile.merit_breakdown.potential },
    { label: 'Motivation', value: profile.merit_breakdown.motivation },
    { label: 'Leadership', value: profile.merit_breakdown.leadership_agency },
    { label: 'Experience', value: profile.merit_breakdown.experience_skills },
    { label: 'Trust', value: profile.merit_breakdown.trust_completeness },
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

  const featureSnapshotEntries = Object.entries(profile.feature_snapshot)

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
              <span className="text-foreground font-semibold">Eligibility:</span>{' '}
              {profile.eligibility_status}
            </p>
            <p>
              <span className="text-foreground font-semibold">Recommendation:</span>{' '}
              {profile.recommendation}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {scoreCards.map((metric) => (
            <Card
              key={metric.label}
              size="sm"
              className="border-primary/20 bg-background/95 shadow-sm"
            >
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle>{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle>Merit radar</CardTitle>
            <CardDescription>Visual comparison of the five key parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-90">
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
              <Card key={metric.label} size="sm" className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle>{metric.value}</CardTitle>
                </CardHeader>
              </Card>
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
                    <li key={flag}>{flag}</li>
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
                    <li key={reason}>{reason}</li>
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
            <CardDescription>Normalized signals in the range 0.00 - 1.00</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-base sm:grid-cols-2 lg:grid-cols-3">
            {featureSnapshotEntries.map(([key, value]) => (
              <p key={key} className="bg-primary/5 text-foreground/85 rounded-md px-3 py-2">
                <span className="text-foreground font-medium">{key}:</span>{' '}
                {typeof value === 'number' ? value.toFixed(2) : value ? 'true' : 'false'}
              </p>
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
