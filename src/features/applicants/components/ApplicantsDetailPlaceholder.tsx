'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
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

  const featureSnapshotEntries = Object.entries(profile.feature_snapshot)

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/applicants">Back to applicants</Link>
          </Button>
          {rank ? <p className="text-sm text-zinc-600">Current rank: #{rank}</p> : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applicant profile</CardTitle>
            <CardDescription>
              Candidate id: {profile.candidate_id} • Scoring run: {profile.scoring_run_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">Name:</span> {profile.candidate_name}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Program:</span> {profile.program_name}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Eligibility:</span>{' '}
              {profile.eligibility_status}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Recommendation:</span>{' '}
              {profile.recommendation}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {scoreCards.map((metric) => (
            <Card key={metric.label} size="sm">
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle>{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Merit breakdown</CardTitle>
            <CardDescription>Potential, Motivation, Leadership, Experience, Trust</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {meritCards.map((metric) => (
              <Card key={metric.label} size="sm" className="bg-zinc-50">
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle>{metric.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review flags and eligibility reasons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">Review flags</p>
              {profile.review_flags.length === 0 ? (
                <p className="text-sm text-zinc-600">No flags</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
                  {profile.review_flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">Eligibility reasons</p>
              {profile.eligibility_reasons.length === 0 ? (
                <p className="text-sm text-zinc-600">No eligibility blockers</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
                  {profile.eligibility_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
              {profile.top_strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Main gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
              {profile.main_gaps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uncertainties</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
              {profile.uncertainties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence spans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.evidence_spans.map((span) => (
              <Card key={`${span.dimension}-${span.source}-${span.text.slice(0, 20)}`} size="sm">
                <CardHeader>
                  <CardDescription>
                    {span.dimension} • {span.source}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-700">{span.text}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature snapshot</CardTitle>
            <CardDescription>Normalized signals in the range 0.00 - 1.00</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {featureSnapshotEntries.map(([key, value]) => (
              <p key={key} className="rounded-md bg-zinc-50 px-3 py-2 text-zinc-700">
                <span className="font-medium text-zinc-900">{key}:</span>{' '}
                {typeof value === 'number' ? value.toFixed(2) : value ? 'true' : 'false'}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            <p>{profile.explanation.summary}</p>
            <div>
              <p className="mb-2 font-medium text-zinc-900">Scoring notes</p>
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
