'use client'

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Hash,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
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
// Top K presets
// ---------------------------------------------------------------------------
const TOP_K_PRESETS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: 'All', value: '' },
] as const

// ---------------------------------------------------------------------------
// Medal helper for top 3 ranks
// ---------------------------------------------------------------------------
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1)
    return <Trophy className="size-5 text-amber-500" aria-label="1st place" />
  if (rank === 2)
    return <Trophy className="size-5 text-gray-400" aria-label="2nd place" />
  if (rank === 3)
    return <Trophy className="size-5 text-amber-700" aria-label="3rd place" />
  return <span className="tabular-nums font-semibold">{rank}</span>
}

// ---------------------------------------------------------------------------
// Category flag dot component
// ---------------------------------------------------------------------------
function CategoryDot({
  active,
  color,
  label,
}: {
  active: boolean
  color: string
  label: string
}) {
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
    return new Set(
      raw
        .split(',')
        .map(Number)
        .filter((n) => n > 0),
    )
  })
  const [topK, setTopK] = useState('')
  const [rankingId, setRankingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const progressCardRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const selectionRowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map())
  const resultRowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map())
  const statCardRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Fetch candidate list for selection
  const candidatesQuery = useApplicantsRankingQuery({
    sort: 'DESC',
    page: 1,
    size: 100,
  })

  const startMutation = useStartRankingMutation()
  const rankingQuery = useRankingResultQuery(rankingId)

  const candidates = candidatesQuery.data?.items ?? []
  const rankingStatus = rankingQuery.data?.status ?? null
  const rankingResult = rankingQuery.data ?? null

  // Client-side search filter
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates
    const q = searchQuery.toLowerCase()
    return candidates.filter(
      (c) =>
        (c.candidate_name ?? '').toLowerCase().includes(q) ||
        (c.program_name ?? '').toLowerCase().includes(q) ||
        String(c.candidate_id).includes(q),
    )
  }, [candidates, searchQuery])

  // Build a quick lookup: candidate_id (number) -> profile name
  const candidateNameMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of candidates) {
      map.set(Number(c.candidate_id), c.candidate_name ?? `#${c.candidate_id}`)
    }
    return map
  }, [candidates])

  // ---------------------------------------------------------------------------
  // GSAP: Page intro animation (selection state)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      prefersReducedMotion() ||
      rankingId !== null ||
      !pageRef.current ||
      candidatesQuery.isLoading
    )
      return

    const sections = pageRef.current.querySelectorAll('[data-animate-section]')
    const rows = selectionRowRefs.current

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (sections.length > 0) {
      tl.fromTo(
        sections,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          clearProps: 'opacity,visibility,transform',
        },
      )
    }

    if (rows.size > 0) {
      const rowEls = Array.from(rows.values())
      tl.fromTo(
        rowEls,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          clearProps: 'opacity,transform',
        },
        sections.length > 0 ? '-=0.3' : 0,
      )
    }

    return () => {
      tl.kill()
    }
  }, [rankingId, candidatesQuery.isLoading])

  // ---------------------------------------------------------------------------
  // GSAP: Pulsing glow on "in-progress" card
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      prefersReducedMotion() ||
      !progressCardRef.current ||
      (rankingStatus !== 'pending' && rankingStatus !== 'processing')
    )
      return

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(progressCardRef.current, {
      boxShadow: '0 0 30px 4px rgba(59, 130, 246, 0.25)',
      duration: 1.2,
      ease: 'sine.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [rankingStatus])

  // ---------------------------------------------------------------------------
  // GSAP: Results reveal animation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      prefersReducedMotion() ||
      rankingStatus !== 'completed' ||
      !resultsRef.current
    )
      return

    const statEls = Array.from(statCardRefs.current.values())
    const rowEls = Array.from(resultRowRefs.current.values())

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (statEls.length > 0) {
      tl.fromTo(
        statEls,
        { autoAlpha: 0, y: 20, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          clearProps: 'opacity,visibility,transform',
        },
      )
    }

    if (rowEls.length > 0) {
      tl.fromTo(
        rowEls,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.04,
          clearProps: 'opacity,transform',
        },
        '-=0.3',
      )
    }

    return () => {
      tl.kill()
    }
  }, [rankingStatus])

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------
  const toggleCandidate = useCallback(
    (id: number) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })

      // GSAP flash on the toggled row
      if (!prefersReducedMotion()) {
        const row = selectionRowRefs.current.get(id)
        if (row) {
          gsap.fromTo(
            row,
            { backgroundColor: 'rgba(99, 102, 241, 0.2)' },
            {
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              duration: 0.4,
              ease: 'power2.out',
              clearProps: 'backgroundColor',
            },
          )
        }
      }
    },
    [],
  )

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
  // Top K chip handler
  // ---------------------------------------------------------------------------
  const handleTopKPreset = useCallback((value: string) => {
    setTopK(value)
  }, [])

  // ---------------------------------------------------------------------------
  // Render: Polling / In-Progress state
  // ---------------------------------------------------------------------------
  if (
    rankingId !== null &&
    (rankingStatus === 'pending' || rankingStatus === 'processing')
  ) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader />
        <div
          ref={progressCardRef}
          className="rounded-xl border border-border dark:border-white/10 bg-card p-10 text-center"
        >
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <h2 className="mt-5 text-xl font-semibold">Ranking in progress...</h2>
          <Badge
            variant="outline"
            className="mt-3 bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30"
          >
            {rankingStatus}
          </Badge>
          <p className="mt-4 text-sm text-muted-foreground">
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
      <div
        ref={resultsRef}
        className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <PageHeader />

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ResultStatCard
            ref={(el) => {
              if (el) statCardRefs.current.set(0, el)
            }}
            label="Total Candidates"
            value={rankingResult.count}
            icon={<Users className="size-5 text-primary" />}
          />
          <ResultStatCard
            ref={(el) => {
              if (el) statCardRefs.current.set(1, el)
            }}
            label="Returned"
            value={rankingResult.returned_count}
            icon={<CheckCircle2 className="size-5 text-emerald-500" />}
          />
          <ResultStatCard
            ref={(el) => {
              if (el) statCardRefs.current.set(2, el)
            }}
            label="Top K"
            value={rankingResult.top_k ?? 'All'}
            icon={<Zap className="size-5 text-amber-500" />}
          />
          <ResultStatCard
            ref={(el) => {
              if (el) statCardRefs.current.set(3, el)
            }}
            label="Scoring Version"
            value={rankingResult.scoring_version ?? 'N/A'}
            icon={<Hash className="size-5 text-sky-500" />}
          />
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-3">
          {rankingResult.shortlist_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="h-8 gap-1.5 px-3 text-sm bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
            >
              <Trophy className="size-4" />
              Shortlist: {rankingResult.shortlist_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.hidden_potential_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="h-8 gap-1.5 px-3 text-sm bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30"
            >
              <Sparkles className="size-4" />
              Hidden Potential:{' '}
              {rankingResult.hidden_potential_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.support_needed_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="h-8 gap-1.5 px-3 text-sm bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
            >
              <Star className="size-4" />
              Support Needed:{' '}
              {rankingResult.support_needed_candidate_ids.length}
            </Badge>
          )}
          {rankingResult.authenticity_review_candidate_ids.length > 0 && (
            <Badge
              variant="outline"
              className="h-8 gap-1.5 px-3 text-sm bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
            >
              <Eye className="size-4" />
              Auth Review:{' '}
              {rankingResult.authenticity_review_candidate_ids.length}
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
                  <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <RankedCandidateRow
                    key={item.candidate_id}
                    ref={(el) => {
                      if (el)
                        resultRowRefs.current.set(item.candidate_id, el)
                    }}
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
    <div
      ref={pageRef}
      className="relative mx-auto max-w-[1440px] space-y-6 px-4 pb-24 pt-8 sm:px-6 lg:px-8"
    >
      {/* Header with subtle gradient accent */}
      <div data-animate-section>
        <div className="relative overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card px-6 py-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
          <div className="relative">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              AI Candidate Ranking
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Select candidates and run the ML ranking pipeline to generate
              prioritised shortlists with explainable scores.
            </p>
          </div>
        </div>
      </div>

      {/* Mutation error */}
      {startMutation.isError && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
          {startMutation.error instanceof Error
            ? startMutation.error.message
            : 'Failed to start ranking'}
        </div>
      )}

      <div
        data-animate-section
        className="rounded-xl border border-border dark:border-white/10 bg-card"
      >
        {/* Header row with selection controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border dark:border-white/10 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold">Select Candidates</h2>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary tabular-nums"
              >
                {selectedIds.size} selected
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="border-b border-border dark:border-white/10 px-4 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search candidates by name, program, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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
          ) : filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery
                ? 'No candidates match your search.'
                : 'No candidates with ML assessments found.'}
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
                {filteredCandidates.map((candidate, idx) => {
                  const numId = Number(candidate.candidate_id)
                  const checked = selectedIds.has(numId)
                  return (
                    <tr
                      key={candidate.candidate_id}
                      ref={(el) => {
                        if (el)
                          selectionRowRefs.current.set(numId, el)
                      }}
                      className={cn(
                        'border-b border-border/50 dark:border-white/5 transition-colors cursor-pointer',
                        checked
                          ? 'bg-primary/5 border-l-2 border-l-primary'
                          : 'hover:bg-muted/30 border-l-2 border-l-transparent',
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
                        {candidate.candidate_name ??
                          `#${candidate.candidate_id}`}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {candidate.program_name}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
                          {candidate.merit_score}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border dark:border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: selected count */}
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="h-8 gap-1.5 px-3 text-sm bg-primary/10 text-primary tabular-nums"
            >
              <Users className="size-3.5" />
              {selectedIds.size} of {candidates.length}
            </Badge>
          </div>

          {/* Center: Top K chips + custom input */}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              Top K:
            </span>
            <div className="flex items-center gap-1">
              {TOP_K_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleTopKPreset(preset.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    topK === preset.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              placeholder="N"
              value={
                TOP_K_PRESETS.some((p) => p.value === topK) ? '' : topK
              }
              onChange={(e) => setTopK(e.target.value)}
              className="h-7 w-16 text-xs"
            />
          </div>

          {/* Right: action button */}
          <Button
            onClick={handleStartRanking}
            disabled={selectedIds.size === 0 || startMutation.isPending}
            size="sm"
            className="h-9"
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
    <div className="relative overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card px-6 py-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          AI Candidate Ranking
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
          Select candidates and run the ML ranking pipeline to generate
          prioritised shortlists with explainable scores.
        </p>
      </div>
    </div>
  )
}

const ResultStatCard = forwardRef<
  HTMLDivElement,
  { label: string; value: string | number; icon: React.ReactNode }
>(({ label, value, icon }, ref) => (
  <div
    ref={ref}
    className="rounded-xl border border-border dark:border-white/10 bg-card px-5 py-4"
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {icon}
    </div>
    <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
  </div>
))
ResultStatCard.displayName = 'ResultStatCard'

const RankedCandidateRow = forwardRef<
  HTMLTableRowElement,
  { item: RankedCandidate; name: string }
>(({ item, name }, ref) => {
  const recStyle = RECOMMENDATION_STYLES[item.recommendation] ?? ''
  const recLabel =
    RECOMMENDATION_LABELS[item.recommendation] ??
    item.recommendation.replace(/_/g, ' ')

  const isTop3 = item.rank_position <= 3

  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border/50 dark:border-white/5 transition-colors',
        isTop3
          ? 'bg-amber-50/30 dark:bg-amber-500/5 hover:bg-amber-50/50 dark:hover:bg-amber-500/10'
          : 'hover:bg-muted/30',
      )}
    >
      <td className="px-4 py-3 text-center">
        <RankMedal rank={item.rank_position} />
      </td>
      <td className="px-4 py-3">
        <span className="font-medium">{name}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">
          #{item.candidate_id}
        </span>
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
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
          {item.merit_score}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {item.confidence_score}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {item.authenticity_risk}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {item.trajectory_score}
      </td>
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
      <td className="px-4 py-3 text-center">
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link href={`/applicants/${item.candidate_id}`}>
            <Eye className="mr-1 size-3.5" />
            View
          </Link>
        </Button>
      </td>
    </tr>
  )
})
RankedCandidateRow.displayName = 'RankedCandidateRow'
