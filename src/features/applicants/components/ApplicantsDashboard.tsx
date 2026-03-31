'use client'

import gsap from 'gsap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
} from 'lucide-react'
import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useApplicantsRankingQuery } from '../api'
import { ELIGIBILITY_OPTIONS, RECOMMENDATION_OPTIONS } from '../constants'
import type {
  ApplicantProfile,
  ApplicantsSortDirection,
  ApplicantsSortField,
  EligibilityStatus,
  Recommendation,
} from '../types'

// ---------------------------------------------------------------------------
// Sort cycle: desc -> asc -> reset (back to score desc)
// ---------------------------------------------------------------------------
type SortState = {
  field: ApplicantsSortField
  direction: ApplicantsSortDirection
} | null

function nextSortState(
  current: SortState,
  clickedField: ApplicantsSortField,
): SortState {
  if (current?.field !== clickedField) {
    return { field: clickedField, direction: 'desc' }
  }
  if (current.direction === 'desc') {
    return { field: clickedField, direction: 'asc' }
  }
  return null // reset
}

// ---------------------------------------------------------------------------
// Badge color helpers
// ---------------------------------------------------------------------------
const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  standard_review: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  manual_review_required: 'bg-violet-50 text-violet-700 border-violet-200',
  review_priority: 'bg-sky-50 text-sky-700 border-sky-200',
  insufficient_evidence: 'bg-orange-50 text-orange-700 border-orange-200',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200',
  invalid: 'bg-red-50 text-red-700 border-red-200',
}

const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  standard_review: 'Standard',
  manual_review_required: 'Manual Review',
  review_priority: 'Priority',
  insufficient_evidence: 'Insufficient',
  incomplete_application: 'Incomplete',
  invalid: 'Invalid',
}

const ELIGIBILITY_STYLES: Record<EligibilityStatus, string> = {
  eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  conditionally_eligible: 'bg-sky-50 text-sky-700 border-sky-200',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200',
  invalid: 'bg-red-50 text-red-700 border-red-200',
}

// ---------------------------------------------------------------------------
// Table column definitions
// ---------------------------------------------------------------------------
interface ColumnDef {
  key: string
  label: string
  sortField?: ApplicantsSortField
  className?: string
  headerClassName?: string
}

const TABLE_COLUMNS: ColumnDef[] = [
  { key: 'rank', label: '#', className: 'w-12 text-center', headerClassName: 'text-center' },
  { key: 'name', label: 'Name', className: 'min-w-[160px]' },
  { key: 'program', label: 'Program', className: 'min-w-[120px]' },
  { key: 'score', label: 'Score', sortField: 'score', className: 'w-20 text-right', headerClassName: 'justify-end' },
  { key: 'potential', label: 'Potential', sortField: 'potential', className: 'w-20 text-right', headerClassName: 'justify-end' },
  { key: 'motivation', label: 'Motivation', sortField: 'motivation', className: 'w-24 text-right', headerClassName: 'justify-end' },
  { key: 'leadership', label: 'Leadership', sortField: 'leadership', className: 'w-24 text-right', headerClassName: 'justify-end' },
  { key: 'experience', label: 'Experience', sortField: 'experience', className: 'w-24 text-right', headerClassName: 'justify-end' },
  { key: 'trust', label: 'Trust', sortField: 'trust', className: 'w-16 text-right', headerClassName: 'justify-end' },
  { key: 'auth_risk', label: 'Auth. Risk', sortField: 'authenticity_risk', className: 'w-24 text-right', headerClassName: 'justify-end' },
  { key: 'confidence', label: 'Confidence', sortField: 'confidence', className: 'w-24 text-right', headerClassName: 'justify-end' },
  { key: 'status', label: 'Status', className: 'w-28' },
]

// ---------------------------------------------------------------------------
// MultiFilterPopover — reusable multi-select filter with popover + checkboxes
// ---------------------------------------------------------------------------
function MultiFilterPopover<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: Array<{ value: T; label: string; dotClassName?: string }>
  selected: Set<T>
  onToggle: (value: T) => void
}) {
  const allSelected = selected.size === options.length
  const count = allSelected ? 0 : selected.size

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="size-3.5" />
          {label}
          {count > 0 && (
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-semibold">
              {count}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex flex-col gap-0.5">
          {options.map((option) => (
            <label
              key={option.value}
              className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={selected.has(option.value)}
                onCheckedChange={() => onToggle(option.value)}
              />
              {option.dotClassName && (
                <span className={cn('size-2 shrink-0 rounded-full', option.dotClassName)} />
              )}
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// SortIcon for column headers
// ---------------------------------------------------------------------------
function SortIcon({ field, sortState }: { field: ApplicantsSortField; sortState: SortState }) {
  if (sortState?.field !== field) {
    return <ArrowUpDown className="size-3.5 opacity-30" />
  }
  if (sortState.direction === 'desc') {
    return <ArrowDown className="text-primary size-3.5" />
  }
  return <ArrowUp className="text-primary size-3.5" />
}

// ---------------------------------------------------------------------------
// Cell value renderer
// ---------------------------------------------------------------------------
function getCellValue(
  applicant: ApplicantProfile,
  columnKey: string,
  rank: number,
): React.ReactNode {
  switch (columnKey) {
    case 'rank':
      return <span className="text-muted-foreground text-sm">{rank}</span>
    case 'name':
      return (
        <span className="text-foreground font-medium">
          {applicant.candidate_name ?? applicant.candidate_id}
        </span>
      )
    case 'program':
      return (
        <span className="text-muted-foreground text-sm">
          {applicant.program_name ?? '-'}
        </span>
      )
    case 'score':
      return (
        <span className="bg-primary/10 text-primary inline-flex min-w-[2.5rem] items-center justify-center rounded-md px-2 py-0.5 text-sm font-bold tabular-nums">
          {applicant.merit_score}
        </span>
      )
    case 'potential':
      return <span className="tabular-nums">{applicant.merit_breakdown.potential}</span>
    case 'motivation':
      return <span className="tabular-nums">{applicant.merit_breakdown.motivation}</span>
    case 'leadership':
      return <span className="tabular-nums">{applicant.merit_breakdown.leadership_agency}</span>
    case 'experience':
      return <span className="tabular-nums">{applicant.merit_breakdown.experience_skills}</span>
    case 'trust':
      return <span className="tabular-nums">{applicant.merit_breakdown.trust_completeness}</span>
    case 'auth_risk':
      return (
        <span className="tabular-nums">
          {Math.round(applicant.authenticity_risk)}%
        </span>
      )
    case 'confidence':
      return <span className="tabular-nums">{applicant.confidence_score}</span>
    case 'status':
      return (
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-medium',
            RECOMMENDATION_STYLES[applicant.recommendation],
          )}
        >
          {RECOMMENDATION_LABELS[applicant.recommendation]}
        </Badge>
      )
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Mobile card component
// ---------------------------------------------------------------------------
function ApplicantMobileCard({
  applicant,
  rank,
  isSelected,
  isDisabled,
  onToggleSelect,
}: {
  applicant: ApplicantProfile
  rank: number
  isSelected: boolean
  isDisabled: boolean
  onToggleSelect: () => void
}) {
  return (
    <Link
      href={`/application/${applicant.candidate_id}`}
      className="block"
      data-animate-applicant-card
    >
      <div className={cn(
        'border-border hover:border-primary/30 relative rounded-xl border bg-white p-4 transition-all hover:shadow-sm',
        isSelected && 'border-primary/40 ring-primary/20 ring-1',
      )}>
        {/* Checkbox top-left */}
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            disabled={isDisabled}
            onCheckedChange={onToggleSelect}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-3 pl-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-medium">
                {rank}
              </span>
              <p className="text-foreground truncate text-sm font-semibold">
                {applicant.candidate_name ?? applicant.candidate_id}
              </p>
            </div>
            <p className="text-muted-foreground mt-1 truncate pl-8 text-xs">
              {applicant.program_name ?? 'No program'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-foreground text-lg font-bold tabular-nums leading-tight">
              {applicant.merit_score}
            </p>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Score</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-8">
          <Badge
            variant="outline"
            className={cn('text-xs', RECOMMENDATION_STYLES[applicant.recommendation])}
          >
            {RECOMMENDATION_LABELS[applicant.recommendation]}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-xs', ELIGIBILITY_STYLES[applicant.eligibility_status])}
          >
            {applicant.eligibility_status.replace(/_/g, ' ')}
          </Badge>
          <span className="text-muted-foreground ml-auto text-xs tabular-nums">
            Risk {Math.round(applicant.authenticity_risk)}%
          </span>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard component
// ---------------------------------------------------------------------------
export function ApplicantsDashboard() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // Sort state: null means default (score desc)
  const [sortState, setSortState] = useState<SortState>({
    field: 'score',
    direction: 'desc',
  })

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEligibility, setSelectedEligibility] = useState<Set<EligibilityStatus>>(
    () => new Set(ELIGIBILITY_OPTIONS.map((o) => o.value)),
  )
  const [selectedRecommendation, setSelectedRecommendation] = useState<Set<Recommendation>>(
    () => new Set(RECOMMENDATION_OPTIONS.map((o) => o.value)),
  )

  // Selection state for comparison
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleCompare = useCallback(() => {
    const ids = Array.from(selectedIds).join(',')
    router.push(`/applicants/compare?ids=${ids}`)
  }, [selectedIds, router])

  // Mobile sort dropdown
  const [mobileSortField, setMobileSortField] = useState<ApplicantsSortField>('score')

  const queryParams = useMemo(
    () => ({
      sortField: sortState?.field ?? 'score',
      sortDirection: sortState?.direction ?? 'desc',
    }),
    [sortState],
  )

  const { data: applicants = [], isLoading } = useApplicantsRankingQuery(queryParams)

  // Filter applicants client-side
  const filteredApplicants = useMemo(() => {
    let result = applicants

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter((a) => {
        const name = (a.candidate_name ?? a.candidate_id).toLowerCase()
        return name.includes(query)
      })
    }

    // Eligibility filter
    if (selectedEligibility.size < ELIGIBILITY_OPTIONS.length) {
      result = result.filter((a) => selectedEligibility.has(a.eligibility_status))
    }

    // Recommendation filter
    if (selectedRecommendation.size < RECOMMENDATION_OPTIONS.length) {
      result = result.filter((a) => selectedRecommendation.has(a.recommendation))
    }

    return result
  }, [applicants, searchQuery, selectedEligibility, selectedRecommendation])

  // Toggle helpers
  const toggleEligibility = useCallback((value: EligibilityStatus) => {
    setSelectedEligibility((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        if (next.size > 1) next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  const toggleRecommendation = useCallback((value: Recommendation) => {
    setSelectedRecommendation((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        if (next.size > 1) next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedEligibility(new Set(ELIGIBILITY_OPTIONS.map((o) => o.value)))
    setSelectedRecommendation(new Set(RECOMMENDATION_OPTIONS.map((o) => o.value)))
    setSortState({ field: 'score', direction: 'desc' })
    setMobileSortField('score')
  }, [])

  const handleColumnSort = useCallback(
    (field: ApplicantsSortField) => {
      setSortState((prev) => nextSortState(prev, field))
    },
    [],
  )

  const handleMobileSortChange = useCallback((value: string) => {
    const field = value as ApplicantsSortField
    setMobileSortField(field)
    setSortState({ field, direction: 'desc' })
  }, [])

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedEligibility.size < ELIGIBILITY_OPTIONS.length ||
    selectedRecommendation.size < RECOMMENDATION_OPTIONS.length

  // Subtle page-level fade-in animation
  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return

    gsap.fromTo(
      root,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' },
    )
  }, [])

  // Animate cards on mobile when data changes
  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root || isLoading || filteredApplicants.length === 0) return

    const cards = root.querySelectorAll('[data-animate-applicant-card]')
    if (cards.length === 0) return

    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
      },
    )
  }, [filteredApplicants, isLoading])

  return (
    <div ref={rootRef} className="min-h-screen bg-[linear-gradient(180deg,#f8faf5_0%,#f1f5f0_40%,#eef2ed_70%,#e8ece7_100%)]">
      <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Applicants Ranking
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filteredApplicants.length} candidate{filteredApplicants.length !== 1 ? 's' : ''}{' '}
            {hasActiveFilters ? '(filtered)' : 'total'}
          </p>
        </div>

        {/* Toolbar: search + filters */}
        <div className="border-border flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="h-9 pl-9 text-sm"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <MultiFilterPopover
                label="Eligibility"
                options={ELIGIBILITY_OPTIONS}
                selected={selectedEligibility}
                onToggle={toggleEligibility}
              />
              <MultiFilterPopover
                label="Recommendation"
                options={RECOMMENDATION_OPTIONS}
                selected={selectedRecommendation}
                onToggle={toggleRecommendation}
              />

              {/* Mobile sort dropdown */}
              <div className="md:hidden">
                <Select value={mobileSortField} onValueChange={handleMobileSortChange}>
                  <SelectTrigger size="sm" className="h-9 w-32 gap-1 text-sm">
                    <ArrowUpDown className="size-3.5 opacity-50" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="potential">Potential</SelectItem>
                    <SelectItem value="motivation">Motivation</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="border-border rounded-xl border bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">Loading applicants...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="border-border rounded-xl border bg-white p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              No applicants match the current filters.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-3 gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="border-border hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border border-b bg-gray-50/80">
                      <th className="w-10 px-3 py-3">
                        <span className="sr-only">Select</span>
                      </th>
                      {TABLE_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={cn(
                            'px-3 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase',
                            col.className,
                            col.sortField && sortState?.field === col.sortField && 'text-foreground',
                          )}
                        >
                          {col.sortField ? (
                            <button
                              type="button"
                              onClick={() => handleColumnSort(col.sortField!)}
                              className={cn(
                                'inline-flex items-center gap-1 transition-colors hover:text-foreground',
                                col.headerClassName,
                              )}
                            >
                              {col.label}
                              <SortIcon field={col.sortField} sortState={sortState} />
                            </button>
                          ) : (
                            <span className={cn('inline-flex items-center', col.headerClassName)}>
                              {col.label}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {filteredApplicants.map((applicant, index) => (
                      <tr
                        key={applicant.candidate_id}
                        className="hover:bg-muted/50 group cursor-pointer transition-colors"
                        onClick={() => {
                          router.push(`/application/${applicant.candidate_id}`)
                        }}
                      >
                        <td className="px-3 py-3">
                          <Checkbox
                            checked={selectedIds.has(applicant.candidate_id)}
                            disabled={
                              !selectedIds.has(applicant.candidate_id) && selectedIds.size >= 3
                            }
                            onCheckedChange={() => toggleSelection(applicant.candidate_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        {TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={cn(
                              'px-3 py-3 text-sm',
                              col.className,
                              col.sortField &&
                                sortState?.field === col.sortField &&
                                'bg-primary/[0.03]',
                            )}
                          >
                            {getCellValue(applicant, col.key, index + 1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {filteredApplicants.map((applicant, index) => (
                <ApplicantMobileCard
                  key={applicant.candidate_id}
                  applicant={applicant}
                  rank={index + 1}
                  isSelected={selectedIds.has(applicant.candidate_id)}
                  isDisabled={!selectedIds.has(applicant.candidate_id) && selectedIds.size >= 3}
                  onToggleSelect={() => toggleSelection(applicant.candidate_id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Sticky comparison bar */}
      {selectedIds.size >= 2 && (
        <div className="border-border fixed bottom-0 right-0 left-0 z-40 border-t bg-white shadow-lg">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <p className="text-foreground text-sm font-medium">
              {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button size="sm" onClick={handleCompare}>
                Compare
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
