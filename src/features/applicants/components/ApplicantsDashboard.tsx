'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useLogoutMutation } from '@/features/auth'
import { useAuthStore } from '@/shared/stores/auth-store'
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
  const router = useRouter()
  const resetAuthStore = useAuthStore((state) => state.reset)
  const logoutMutation = useLogoutMutation()

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

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    resetAuthStore()
    router.replace('/auth')
  }

  const handleResetSorting = () => {
    setSortField(DEFAULT_SORT_FIELD)
    setSortDirection(DEFAULT_SORT_DIRECTION)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
              LOGO
            </div>
            <div className="text-sm font-semibold text-zinc-900">Applicants Dashboard</div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm">
              Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Filters and sorting</CardTitle>
            <CardDescription>
              Select ranking metric using button group and set sorting direction using dropdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-700">Ranking metric</p>
              <div data-slot="button-group" className="flex flex-wrap items-center gap-2">
                {SORT_FIELD_BUTTONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={sortField === option.value ? 'default' : 'outline'}
                    onClick={() => setSortField(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-zinc-700">Sort direction</p>
              <Select
                value={sortDirection}
                onValueChange={(value: ApplicantsSortDirection) => setSortDirection(value)}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="outline" onClick={handleResetSorting}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicants ranking</CardTitle>
            <CardDescription>
              Sorted by {getSortFieldLabel(sortField)} in {sortDirection} order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-zinc-600">Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p className="text-sm text-zinc-600">
                No applicants found for current filter settings.
              </p>
            ) : (
              <div className="space-y-3">
                {applicants.map((applicant, index) => (
                  <Link
                    key={applicant.candidate_id}
                    href={`/applicants/${applicant.candidate_id}`}
                    className="block"
                  >
                    <Card className="border border-zinc-200 bg-white py-0 transition hover:border-zinc-300 hover:bg-zinc-50">
                      <CardContent className="space-y-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-zinc-900">
                              {applicant.candidate_name}
                            </p>
                            <p className="text-sm text-zinc-600">{applicant.program_name}</p>
                          </div>
                          <Badge variant="secondary">Rank #{index + 1}</Badge>
                        </div>

                        <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
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

                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>Confidence: {applicant.confidence_score}</span>
                          <span>Authenticity Risk: {applicant.authenticity_risk}</span>
                        </div>

                        <div className="text-xs text-zinc-500">
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
