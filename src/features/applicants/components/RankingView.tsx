'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  useApplicantsRankingQuery,
  useRankingResultQuery,
  useStartRankingMutation,
} from '../api'
import type { RankedCandidate, Recommendation } from '../types'

// ---------------------------------------------------------------------------
// Recommendation badge styles (matching ApplicantsDashboard)
// ---------------------------------------------------------------------------
const RECOMMENDATION_STYLES: Record<string, string> = {
  standard_review:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  manual_review_required:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  review_priority:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  insufficient_evidence:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
  incomplete_application:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  invalid:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  standard_review: 'Standard',
  manual_review_required: 'Manual Review',
  review_priority: 'Priority',
  insufficient_evidence: 'Insufficient',
  incomplete_application: 'Incomplete',
  invalid: 'Invalid',
}

// ---------------------------------------------------------------------------
// Category flag dot component
// ---------------------------------------------------------------------------
function CategoryDot({ active, color, label }: { active: boolean; color: string; label: string }) {
  if (!active) return null
  return (
    <span
      title={label}
      className={cn('inline-block size-2.5 rounded-full', color)}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function RankingView() {
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    const raw = searchParams.get('ids')
    if (!raw) return new Set()
    return new Set(raw.split(',').map(Number).filter((n) => n > 0))
  })
  const [topK, setTopK] = useState('')
  const [rankingId, setRankingId] = useState<number | null>(null)

  // Fetch candidate list for selection
  const candidatesQuery = useApplicantsRankingQuery({
    sortField: 'score',
    sortDirection: 'desc',
    page: 1,
    size: 100,
  })

  const startMutation = useStartRankingMutation()
  const rankingQuery = useRankingResultQuery(rankingId)

  const candidates = candidatesQuery.data?.items ?? []
  const rankingStatus = rankingQuery.data?.status ?? null
  const rankingResult = rankingQuery.data ?? null

  // Build a quick lookup: candidate_id (number) -> profile name
  const candidateNameMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of candidates) {
      map.set(Number(c.candidate_id), c.candidate_name ?? `#${c.candidate_id}`)
    }
    return map
  }, [candidates])

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------
  const toggleCandidate = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(candidates.map((c) => Number(c.candidate_id))))
  }, [candidates])

  const clearAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // ---------------------------------------------------------------------------
  // Start ranking
  // ---------------------------------------------------------------------------
  const handleStartRanking = useCallback(async () => {
    const candidateIds = Array.from(selectedIds)
    const parsedTopK = topK ? Number.parseInt(topK, 10) : undefined
    const payload: { candidate_ids: number[]; top_k?: number } = {
      candidate_ids: candidateIds,
    }
    if (parsedTopK && parsedTopK > 0) {
      payload.top_k = parsedTopK
    }

    try {
      const result = await startMutation.mutateAsync(payload)
      setRankingId(result.ranking_id)
    } catch {
      // Error is handled by mutation state
    }
  }, [selectedIds, topK, startMutation])

  const handleReset = useCallback(() => {
    setRankingId(null)
    startMutation.reset()
  }, [startMutation])

  // ---------------------------------------------------------------------------
  // Render: Polling / In-Progress state
  // ---------------------------------------------------------------------------
  if (rankingId !== null && (rankingStatus === 'pending' || rankingStatus === 'processing')) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader />
        <div className="rounded-xl border border-border dark:border-white/10 bg-card p-8 text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Ranking in progress...</h2>
          <Badge
            variant="outline"
            className="mt-2 bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30"
          >
            {rankingStatus}
          </Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            Polling for results every 3 seconds...
          </p>
          <Button variant="outline" className="mt-6" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" />
            Cancel / Start New
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Failed state
  // ---------------------------------------------------------------------------
  if (rankingId !== null && rankingStatus === 'failed') {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader />
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-8 text-center">
          <AlertTriangle className="mx-auto size-10 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
            Ranking Failed
          </h2>
          {rankingResult?.error_message && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              {rankingResult.error_message}
            </p>
          )}
          <Button variant="outline" className="mt-6" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Completed state
  // ---------------------------------------------------------------------------
  if (rankingId !== null && rankingStatus === 'completed' && rankingResult) {
    const sortedItems = [...rankingResult.items].sort(
      (a, b) => a.rank_position - b.rank_position,
    )

    return (
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader />

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Candidates" value={rankingResult.count} />
          <StatCard label="Returned" value={rankingResult.returned_count} />
          <StatCard label="Top K" value={rankingResult.top_k ?? 'All'} />
          <StatCard label="Scoring Version" value={rankingResult.scoring_version ?? 'N/A'} />
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-2">
          {rankingResult.shortlist_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
            >
              <Trophy className="mr-1 size-3" />
              Shortlist: {rankingResult.shortlist_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.hidden_potential_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30"
            >
              <Sparkles className="mr-1 size-3" />
              Hidden Potential: {rankingResult.hidden_potential_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.support_needed_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
            >
              Support Needed: {rankingResult.support_needed_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.authenticity_review_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
            >
              <Eye className="mr-1 size-3" />
              Auth Review: {rankingResult.authenticity_review_candidate_ids.length}
            </Badge>
          )}
        </div>

        {/* Results table */}
        <div className="rounded-xl border border-border dark:border-white/10 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-muted/40">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                    Rank
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                    Candidate
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                    Recommendation
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                    Merit
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                    Confidence
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                    Auth Risk
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                    Trajectory
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <RankedCandidateRow
                    key={item.candidate_id}
                    item={item}
                    name={
                      candidateNameMap.get(item.candidate_id) ??
                      `Candidate #${item.candidate_id}`
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" />
            Run New Ranking
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Selection state (default)
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader />

      {/* Mutation error */}
      {startMutation.isError && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
          {startMutation.error instanceof Error
            ? startMutation.error.message
            : 'Failed to start ranking'}
        </div>
      )}

      <div className="rounded-xl border border-border dark:border-white/10 bg-card">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border dark:border-white/10 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold">Select Candidates</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {/* Top K input */}
        <div className="border-b border-border dark:border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Label htmlFor="top-k-input" className="shrink-0 text-sm font-medium">
              Top K (optional)
            </Label>
            <Input
              id="top-k-input"
              type="number"
              min={1}
              placeholder="e.g. 10"
              value={topK}
              onChange={(e) => setTopK(e.target.value)}
              className="w-28"
            />
          </div>
        </div>

        {/* Candidates table */}
        <div className="overflow-x-auto">
          {candidatesQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No candidates with ML assessments found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-muted/40">
                  <th className="w-10 px-4 py-2.5" />
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Program
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, idx) => {
                  const numId = Number(candidate.candidate_id)
                  const checked = selectedIds.has(numId)
                  return (
                    <tr
                      key={candidate.candidate_id}
                      className={cn(
                        'border-b border-border/50 dark:border-white/5 transition-colors cursor-pointer',
                        checked
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/30',
                      )}
                      onClick={() => toggleCandidate(numId)}
                    >
                      <td className="px-4 py-2.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleCandidate(numId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {candidate.candidate_name ?? `#${candidate.candidate_id}`}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {candidate.program_name}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {candidate.merit_score}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-border dark:border-white/10 px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} of {candidates.length} selected
          </p>
          <Button
            onClick={handleStartRanking}
            disabled={selectedIds.size === 0 || startMutation.isPending}
          >
            {startMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 size-4" />
                Run AI Ranking
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Candidate Ranking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Select candidates and run the ML ranking pipeline to generate prioritised shortlists with
        explainable scores.
      </p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border dark:border-white/10 bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function RankedCandidateRow({ item, name }: { item: RankedCandidate; name: string }) {
  const recStyle = RECOMMENDATION_STYLES[item.recommendation] ?? ''
  const recLabel =
    RECOMMENDATION_LABELS[item.recommendation] ?? item.recommendation.replace(/_/g, ' ')

  return (
    <tr className="border-b border-border/50 dark:border-white/5 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-semibold tabular-nums">{item.rank_position}</td>
      <td className="px-4 py-3">
        <span className="font-medium">{name}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">#{item.candidate_id}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none',
            recStyle,
          )}
        >
          {recLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums font-medium">{item.merit_score}</td>
      <td className="px-4 py-3 text-right tabular-nums">{item.confidence_score}</td>
      <td className="px-4 py-3 text-right tabular-nums">{item.authenticity_risk}</td>
      <td className="px-4 py-3 text-right tabular-nums">{item.trajectory_score}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          <CategoryDot
            active={item.is_shortlist_candidate}
            color="bg-amber-500"
            label="Shortlist"
          />
          <CategoryDot
            active={item.is_hidden_potential_candidate}
            color="bg-violet-500"
            label="Hidden Potential"
          />
          <CategoryDot
            active={item.is_support_needed_candidate}
            color="bg-orange-500"
            label="Support Needed"
          />
          <CategoryDot
            active={item.is_authenticity_review_candidate}
            color="bg-red-500"
            label="Authenticity Review"
          />
        </div>
      </td>
    </tr>
  )
}
