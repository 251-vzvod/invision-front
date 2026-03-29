'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useApplicantsRankingQuery } from '../api'
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, SORT_FIELD_BUTTONS } from '../constants'
import type { ApplicantProfile, ApplicantsSortDirection, ApplicantsSortField } from '../types'

const getSortFieldLabel = (sortField: ApplicantsSortField): string => {
  if (sortField === 'score') {
    return 'Score'
  }

  if (sortField === 'potential') {
    return 'Potential'
  }

  if (sortField === 'motivation') {
    return 'Motivation'
  }

  if (sortField === 'leadership') {
    return 'Leadership'
  }

  if (sortField === 'experience') {
    return 'Experience'
  }

  return 'Trust'
}

const getApplicantMetricValue = (
  applicant: ApplicantProfile,
  sortField: ApplicantsSortField,
): string => {
  if (sortField === 'score') {
    return applicant.merit_score.toString()
  }

  if (sortField === 'potential') {
    return applicant.merit_breakdown.potential.toString()
  }

  if (sortField === 'motivation') {
    return applicant.merit_breakdown.motivation.toString()
  }

  if (sortField === 'leadership') {
    return applicant.merit_breakdown.leadership_agency.toString()
  }

  if (sortField === 'experience') {
    return applicant.merit_breakdown.experience_skills.toString()
  }

  return applicant.merit_breakdown.trust_completeness.toString()
}

export function ApplicantsDashboard() {
  const [sortField, setSortField] = useState<ApplicantsSortField>(DEFAULT_SORT_FIELD)
  const [sortDirection, setSortDirection] =
    useState<ApplicantsSortDirection>(DEFAULT_SORT_DIRECTION)

  const queryParams = useMemo(
    () => ({
      sortField,
      sortDirection,
    }),
    [sortField, sortDirection],
  )

  const { data: applicants = [], isLoading } = useApplicantsRankingQuery(queryParams)

  const handleResetSorting = () => {
    setSortField(DEFAULT_SORT_FIELD)
    setSortDirection(DEFAULT_SORT_DIRECTION)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(166,216,10,0.18)_0%,transparent_38%),radial-gradient(circle_at_90%_15%,rgba(193,241,29,0.15)_0%,transparent_42%),linear-gradient(180deg,#f8fafc_0%,#f3f8df_100%)]">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="border-primary/25 bg-background/85 rounded-2xl border p-6 shadow-sm backdrop-blur">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Applicants Ranking
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Sort candidates by score or any key merit dimension to compare strengths.
          </p>
        </section>

        <Card className="border-primary/20 bg-background/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Filters and sorting</CardTitle>
            <CardDescription>
              Select ranking metric using button group and set sorting direction using dropdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-foreground text-base font-medium">Ranking metric</p>
              <div data-slot="button-group" className="flex flex-wrap items-center gap-2.5">
                {SORT_FIELD_BUTTONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="default"
                    variant={sortField === option.value ? 'default' : 'outline'}
                    onClick={() => setSortField(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-foreground text-base font-medium">Sort direction</p>
              <Select
                value={sortDirection}
                onValueChange={(value: ApplicantsSortDirection) => setSortDirection(value)}
              >
                <SelectTrigger size="default" className="w-48">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" size="default" variant="outline" onClick={handleResetSorting}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-background/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Applicants ranking</CardTitle>
            <CardDescription>
              Sorted by {getSortFieldLabel(sortField)} in {sortDirection} order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-base">Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p className="text-muted-foreground text-base">
                No applicants found for current filter settings.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {applicants.map((applicant, index) => (
                  <Link
                    key={applicant.candidate_id}
                    href={`/applicants/${applicant.candidate_id}`}
                    className="block"
                  >
                    <Card className="border-primary/20 from-background to-primary/5 hover:border-primary/35 h-full border bg-linear-to-b py-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="space-y-4 py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-foreground text-lg font-semibold">
                              {applicant.candidate_name}
                            </p>
                            <p className="text-muted-foreground text-base">
                              {applicant.program_name}
                            </p>
                          </div>
                          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                            Rank #{index + 1}
                          </Badge>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <Badge variant={sortField === 'score' ? 'secondary' : 'outline'}>
                            Score: {applicant.merit_score}
                          </Badge>
                          <Badge variant={sortField === 'potential' ? 'secondary' : 'outline'}>
                            Potential: {applicant.merit_breakdown.potential}
                          </Badge>
                          <Badge variant={sortField === 'motivation' ? 'secondary' : 'outline'}>
                            Motivation: {applicant.merit_breakdown.motivation}
                          </Badge>
                          <Badge variant={sortField === 'leadership' ? 'secondary' : 'outline'}>
                            Leadership: {applicant.merit_breakdown.leadership_agency}
                          </Badge>
                          <Badge variant={sortField === 'experience' ? 'secondary' : 'outline'}>
                            Experience: {applicant.merit_breakdown.experience_skills}
                          </Badge>
                          <Badge variant={sortField === 'trust' ? 'secondary' : 'outline'}>
                            Trust: {applicant.merit_breakdown.trust_completeness}
                          </Badge>
                        </div>

                        <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                          <span>Confidence: {applicant.confidence_score}</span>
                          <span>Authenticity Risk: {applicant.authenticity_risk}</span>
                        </div>

                        <div className="text-muted-foreground text-sm">
                          Current metric value: {getApplicantMetricValue(applicant, sortField)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
