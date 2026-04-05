'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react'
import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
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
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Separator } from '@/shared/ui/separator'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { useApplicantsRankingQuery, useSetDecisionMutation } from '../api'
import { DECISION_OPTIONS, ELIGIBILITY_OPTIONS, RECOMMENDATION_OPTIONS, type DecisionFilterValue } from '../constants'
import type {
  ApplicantProfile,
  ApplicantsQueryParams,
  CandidateDecision,
  EligibilityStatus,
  Recommendation,
} from '../types'

gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// Badge color helpers
// ---------------------------------------------------------------------------
const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  standard_review: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  manual_review_required: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  review_priority: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  insufficient_evidence: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  invalid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
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
  eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  conditionally_eligible: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  incomplete_application: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  invalid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

// ---------------------------------------------------------------------------
// Decision badge helper
// ---------------------------------------------------------------------------
function DecisionBadge({ decision }: { decision: CandidateDecision }) {
  if (!decision) return null

  const config: Record<NonNullable<CandidateDecision>, { icon: React.ReactNode; className: string }> = {
    approved: {
      icon: <CheckCircle2 className="size-3" />,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    },
    shortlisted: {
      icon: <Star className="size-3" />,
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    },
    rejected: {
      icon: <XCircle className="size-3" />,
      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
    },
  }

  const { icon, className } = config[decision]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none',
        className,
      )}
    >
      {icon}
      {decision.charAt(0).toUpperCase() + decision.slice(1)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Table column definitions
// ---------------------------------------------------------------------------
interface ColumnDef {
  key: string
  label: string
  className?: string
  headerClassName?: string
  sortField?: keyof ApplicantProfile
}

const TABLE_COLUMNS: ColumnDef[] = [
  { key: 'rank', label: '#', className: 'w-12 text-center', headerClassName: 'justify-center' },
  { key: 'name', label: 'Name', className: 'min-w-[160px]' },
  { key: 'program', label: 'Program', className: 'min-w-[120px]' },
  { key: 'score', label: 'Score', className: 'w-20 text-center', headerClassName: 'justify-center', sortField: 'merit_score' },
  { key: 'hidden_potential', label: 'Hidden Potential', className: 'w-28 text-center', headerClassName: 'justify-center', sortField: 'hidden_potential_score' },
  { key: 'trajectory', label: 'Trajectory', className: 'w-24 text-center', headerClassName: 'justify-center', sortField: 'trajectory_score' },
  { key: 'shortlist_priority', label: 'Shortlist Priority', className: 'w-28 text-center', headerClassName: 'justify-center', sortField: 'shortlist_priority_score' },
  { key: 'evidence_coverage', label: 'Evidence Coverage', className: 'w-28 text-center', headerClassName: 'justify-center', sortField: 'evidence_coverage_score' },
  { key: 'support_needed', label: 'Support Needed', className: 'w-28 text-center', headerClassName: 'justify-center', sortField: 'support_needed_score' },
  { key: 'auth_risk', label: 'Auth. Risk', className: 'w-24 text-center', headerClassName: 'justify-center', sortField: 'authenticity_risk' },
  { key: 'confidence', label: 'Confidence', className: 'w-24 text-center', headerClassName: 'justify-center', sortField: 'confidence_score' },
  { key: 'status', label: 'Status', className: 'w-28 text-center', headerClassName: 'justify-center' },
]

// ---------------------------------------------------------------------------
// MultiFilterPopover — multi-select filter with draft state, Apply/Reset
// Desktop: Popover · Mobile: bottom Sheet
// ---------------------------------------------------------------------------
function MultiFilterPopover<T extends string>({
  label,
  options,
  applied,
  onApply,
}: {
  label: string
  options: Array<{ value: T; label: string; dotClassName?: string }>
  applied: Set<T>
  onApply: (value: Set<T>) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  // Draft state — initialized from `applied` whenever the popover opens
  const allValues = useMemo(() => new Set(options.map((o) => o.value)), [options])
  const [draft, setDraft] = useState<Set<T>>(() => (applied.size === 0 ? new Set(allValues) : new Set(applied)))

  // Re-sync draft when popover opens
  useEffect(() => {
    if (open) {
      setDraft(applied.size === 0 ? new Set(allValues) : new Set(applied))
    }
  }, [open, applied, allValues])

  const isAllSelected = draft.size === options.length
  const isNoneSelected = draft.size === 0

  const toggleDraftValue = useCallback((value: T) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setDraft(new Set())
    } else {
      setDraft(new Set(allValues))
    }
  }, [isAllSelected, allValues])

  const handleApply = useCallback(() => {
    // All selected or none selected → clear filter
    if (draft.size === options.length || draft.size === 0) {
      onApply(new Set())
    } else {
      onApply(new Set(draft))
    }
    setOpen(false)
  }, [draft, options.length, onApply])

  const handleReset = useCallback(() => {
    onApply(new Set())
    setOpen(false)
  }, [onApply])

  // Badge: show only when there is an active partial filter
  const showBadge = applied.size > 0 && applied.size < options.length

  // Shared checkbox list
  const checkboxList: ReactNode = (
    <div className="flex flex-col gap-0.5">
      {/* Select All */}
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent">
        <Checkbox
          checked={isAllSelected ? true : isNoneSelected ? false : 'indeterminate'}
          onCheckedChange={handleSelectAll}
        />
        <span>Select All</span>
      </label>
      <Separator className="my-0.5" />
      {/* Options */}
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-accent"
        >
          <Checkbox
            checked={draft.has(option.value)}
            onCheckedChange={() => toggleDraftValue(option.value)}
          />
          {option.dotClassName && (
            <span className={cn('size-2 shrink-0 rounded-full', option.dotClassName)} />
          )}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )

  // Shared footer buttons
  const footerButtons: ReactNode = (
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" size="sm" onClick={handleReset}>
        Reset
      </Button>
      <Button size="sm" onClick={handleApply}>
        Apply
      </Button>
    </div>
  )

  // Trigger button (shared between Popover and Sheet)
  const triggerButton = (
    <Button variant="outline" size="sm" className="gap-1.5">
      <Filter className="size-3.5" />
      {label}
      {showBadge && (
        <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-semibold">
          {applied.size}
        </span>
      )}
      <ChevronDown className="size-3.5 opacity-50" />
    </Button>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="px-4 overflow-y-auto max-h-[50vh]">{checkboxList}</div>
          <SheetFooter>{footerButtons}</SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 border-border dark:border-white/10 bg-popover p-2">
        {checkboxList}
        <Separator className="my-1.5" />
        {footerButtons}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Cell value renderer
// ---------------------------------------------------------------------------
function getCellValue(
  applicant: ApplicantProfile,
  columnKey: string,
  rank: number,
  decision?: CandidateDecision,
): React.ReactNode {
  switch (columnKey) {
    case 'rank':
      return <span className="text-sm text-muted-foreground">{rank}</span>
    case 'name':
      return (
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-foreground">
            {applicant.candidate_name ?? applicant.candidate_id}
          </span>
          <DecisionBadge decision={decision ?? null} />
        </div>
      )
    case 'program':
      return (
        <span className="text-sm text-muted-foreground">
          {applicant.program_name ?? '-'}
        </span>
      )
    case 'score':
      return (
        <span className="bg-primary/10 text-primary inline-flex min-w-[2.5rem] items-center justify-center rounded-md px-2 py-0.5 text-sm font-bold tabular-nums">
          {applicant.merit_score}
        </span>
      )
    case 'hidden_potential':
      return <span className="tabular-nums text-foreground/80">{applicant.hidden_potential_score}</span>
    case 'trajectory':
      return <span className="tabular-nums text-foreground/80">{applicant.trajectory_score}</span>
    case 'shortlist_priority':
      return <span className="tabular-nums text-foreground/80">{applicant.shortlist_priority_score}</span>
    case 'evidence_coverage':
      return <span className="tabular-nums text-foreground/80">{applicant.evidence_coverage_score}</span>
    case 'support_needed':
      return <span className="tabular-nums text-foreground/80">{applicant.support_needed_score}</span>
    case 'auth_risk':
      return (
        <span className="tabular-nums text-foreground/80">
          {Math.round(applicant.authenticity_risk)}%
        </span>
      )
    case 'confidence':
      return <span className="tabular-nums text-foreground/80">{applicant.confidence_score}</span>
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
  onToggleSelect,
  decision,
}: {
  applicant: ApplicantProfile
  rank: number
  isSelected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
  decision: CandidateDecision
}) {
  return (
    <Link
      href={`/application/${applicant.candidate_id}`}
      className="block"
      data-animate-applicant-card
    >
      <div className={cn(
        'relative rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-4 transition-all hover:border-primary/30 hover:bg-accent',
        isSelected && 'border-primary/40 ring-primary/20 ring-1',
      )}>
        {/* Checkbox top-left */}
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onToggleSelect(e as unknown as React.MouseEvent)
            }}
            onCheckedChange={() => {/* handled by onClick for shiftKey */}}
          />
        </div>

        <div className="flex items-start justify-between gap-3 pl-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                {rank}
              </span>
              <p className="truncate text-sm font-semibold text-foreground">
                {applicant.candidate_name ?? applicant.candidate_id}
              </p>
              <DecisionBadge decision={decision} />
            </div>
            <p className="mt-1 truncate pl-8 text-xs text-muted-foreground">
              {applicant.program_name ?? 'No program'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums leading-tight text-foreground">
              {applicant.merit_score}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
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
          <span className="ml-auto text-xs tabular-nums text-muted-foreground/50">
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

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)

  // Sort state (server-side: ASC or DESC by score)
  const [sort, setSort] = useState<'ASC' | 'DESC'>('DESC')

  // Client-side column sort
  const [sortColKey, setSortColKey] = useState<string>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleColSort = useCallback((colKey: string) => {
    setSortColKey((prev) => {
      if (prev === colKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDir('desc')
      }
      return colKey
    })
  }, [])

  // Filter state (server-side — multiple values sent as comma-separated)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEligibility, setSelectedEligibility] = useState<Set<EligibilityStatus>>(new Set())
  const [selectedRecommendation, setSelectedRecommendation] = useState<Set<Recommendation>>(new Set())
  const [selectedDecision, setSelectedDecision] = useState<Set<DecisionFilterValue>>(new Set())

  // Selection state (no limit — batch actions work on any count)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const lastClickedIndexRef = useRef<number | null>(null)
  const { mutate: setDecision } = useSetDecisionMutation()
  const filteredApplicantsRef = useRef<ApplicantProfile[]>([])

  // Optimistic decision overrides (cleared when query refetches)
  const [decisions, setDecisions] = useState<Map<string, CandidateDecision>>(new Map())

  const getDecision = useCallback(
    (applicant: ApplicantProfile): CandidateDecision => {
      if (decisions.has(applicant.candidate_id)) return decisions.get(applicant.candidate_id)!
      if (!applicant.decision || applicant.decision === 'no_decision') return null
      return applicant.decision
    },
    [decisions],
  )

  // Batch confirmation dialog state
  const [pendingBatchDecision, setPendingBatchDecision] = useState<NonNullable<CandidateDecision> | null>(null)

  // Rank — navigate to ranking page with selected IDs

  const toggleSelection = useCallback(
    (id: string, index: number, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)

        if (shiftKey && lastClickedIndexRef.current !== null) {
          // Shift+Click: select range between last clicked and current
          const list = filteredApplicantsRef.current
          const start = Math.min(lastClickedIndexRef.current, index)
          const end = Math.max(lastClickedIndexRef.current, index)
          for (let i = start; i <= end; i++) {
            const candidate = list[i]
            if (candidate) {
              next.add(candidate.candidate_id)
            }
          }
        } else {
          // Normal click: toggle single
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
        }

        return next
      })
      lastClickedIndexRef.current = index
    },
    [],
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleCompare = useCallback(() => {
    const ids = Array.from(selectedIds).join(',')
    router.push(`/applicants/compare?ids=${ids}`)
  }, [selectedIds, router])

  const applyDecision = useCallback(
    (decision: NonNullable<CandidateDecision>) => {
      for (const id of selectedIds) {
        setDecision(
          { candidateId: id, decision },
          {
            onSuccess: () => {
              setDecisions((prev) => {
                const next = new Map(prev)
                next.set(id, decision)
                return next
              })
            },
          },
        )
      }
      setSelectedIds(new Set())
    },
    [selectedIds, setDecision],
  )

  const hasRejectedInSelection = useMemo(() => {
    for (const id of selectedIds) {
      if (decisions.get(id) === 'rejected') return true
    }
    return false
  }, [selectedIds, decisions])

  const handleBatchDecisionClick = useCallback(
    (decision: NonNullable<CandidateDecision>) => {
      // Approve and Reject always need confirmation
      if (decision === 'approved' || decision === 'rejected') {
        setPendingBatchDecision(decision)
        return
      }
      // Shortlist needs confirmation only if any selected candidate is rejected
      if (decision === 'shortlisted' && hasRejectedInSelection) {
        setPendingBatchDecision(decision)
        return
      }
      // Otherwise apply directly
      applyDecision(decision)
    },
    [applyDecision, hasRejectedInSelection],
  )

  const confirmBatchDecision = useCallback(() => {
    if (pendingBatchDecision) {
      applyDecision(pendingBatchDecision)
    }
    setPendingBatchDecision(null)
  }, [pendingBatchDecision, applyDecision])

  const handleRankClick = useCallback(() => {
    const ids = Array.from(selectedIds).join(',')
    router.push(`/applicants/ranking?ids=${ids}`)
  }, [selectedIds, router])

  // Build query params for server-side filtering/sorting
  const queryParams: ApplicantsQueryParams = useMemo(
    () => ({
      sort,
      recommendation: selectedRecommendation.size > 0 ? Array.from(selectedRecommendation) : null,
      eligibility: selectedEligibility.size > 0 ? Array.from(selectedEligibility) : null,
      decision: selectedDecision.size > 0
        ? Array.from(selectedDecision).map((d) => (d === 'pending' ? 'no_decision' : d))
        : null,
      page,
      size: pageSize,
    }),
    [sort, selectedRecommendation, selectedEligibility, selectedDecision, page, pageSize],
  )

  const { data, isLoading } = useApplicantsRankingQuery(queryParams)
  const applicants = data?.items ?? []
  const hasMore = data?.hasMore ?? false

  // Client-side search filter only (other filters are handled server-side)
  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants

    const query = searchQuery.trim().toLowerCase()
    return applicants.filter((a) => {
      const name = (a.candidate_name ?? a.candidate_id).toLowerCase()
      return name.includes(query)
    })
  }, [applicants, searchQuery])

  // Client-side column sort applied on top of search filter
  const sortedApplicants = useMemo(() => {
    const col = TABLE_COLUMNS.find((c) => c.key === sortColKey)
    if (!col?.sortField) return filteredApplicants
    const field = col.sortField
    return [...filteredApplicants].sort((a, b) => {
      const aVal = (a[field] as number) ?? 0
      const bVal = (b[field] as number) ?? 0
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [filteredApplicants, sortColKey, sortDir])

  // Keep ref in sync for shift+click range selection
  filteredApplicantsRef.current = sortedApplicants

  // Filter apply handlers — called by MultiFilterPopover on Apply/Reset
  const handleApplyEligibility = useCallback((value: Set<EligibilityStatus>) => {
    setSelectedEligibility(value)
    setPage(1)
  }, [])

  const handleApplyRecommendation = useCallback((value: Set<Recommendation>) => {
    setSelectedRecommendation(value)
    setPage(1)
  }, [])

  const handleApplyDecision = useCallback((value: Set<DecisionFilterValue>) => {
    setSelectedDecision(value)
    setPage(1)
  }, [])

  const toggleSort = useCallback(() => {
    setSort((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedEligibility(new Set())
    setSelectedRecommendation(new Set())
    setSelectedDecision(new Set())
    setSort('DESC')
    setPage(1)
  }, [])

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedEligibility.size > 0 ||
    selectedRecommendation.size > 0 ||
    selectedDecision.size > 0

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

  // ScrollTrigger for toolbar and table
  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const toolbar = root.querySelector('[data-animate-toolbar]')
      const table = root.querySelector('[data-animate-table]')

      if (toolbar) {
        gsap.fromTo(
          toolbar,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: toolbar, start: 'top 90%', once: true },
          },
        )
      }

      if (table) {
        gsap.fromTo(
          table,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: table, start: 'top 90%', once: true },
          },
        )
      }
    }, root)

    return () => { ctx.revert() }
  }, [isLoading])

  return (
    <div ref={rootRef} className="min-h-screen bg-dashboard">
      <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Applicants Ranking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredApplicants.length} candidate{filteredApplicants.length !== 1 ? 's' : ''}{' '}
            {hasActiveFilters ? '(filtered)' : 'total'}
          </p>
        </div>

        {/* Toolbar: search + filters */}
        <div data-animate-toolbar className="flex flex-col gap-3 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
                applied={selectedEligibility}
                onApply={handleApplyEligibility}
              />
              <MultiFilterPopover
                label="Recommendation"
                options={RECOMMENDATION_OPTIONS}
                applied={selectedRecommendation}
                onApply={handleApplyRecommendation}
              />
              <MultiFilterPopover
                label="Decision"
                options={DECISION_OPTIONS}
                applied={selectedDecision}
                onApply={handleApplyDecision}
              />

              {/* Sort direction toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSort}
                className="gap-1.5"
              >
                {sort === 'DESC' ? (
                  <ArrowDown className="size-3.5" />
                ) : (
                  <ArrowUp className="size-3.5" />
                )}
                {sort === 'DESC' ? 'Highest first' : 'Lowest first'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters && sort === 'DESC'}
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
          <div className="space-y-0">
            {/* Table header skeleton */}
            <Skeleton className="h-10 w-full rounded-t-xl rounded-b-none" />
            {/* Table body rows */}
            <div className="overflow-hidden rounded-b-xl border border-t-0 border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border dark:border-white/10 px-4 last:border-b-0">
                  <Skeleton className="my-3 h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-12 text-center">
            <p className="text-sm text-muted-foreground">
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
            <div data-animate-table className="hidden overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-white/10 bg-muted/50 dark:bg-white/[0.03]">
                      <th className="w-10 px-3 py-3">
                        <Checkbox
                          checked={
                            sortedApplicants.length > 0 &&
                            sortedApplicants.every((a) => selectedIds.has(a.candidate_id))
                              ? true
                              : sortedApplicants.some((a) => selectedIds.has(a.candidate_id))
                                ? 'indeterminate'
                                : false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds(new Set(sortedApplicants.map((a) => a.candidate_id)))
                            } else {
                              setSelectedIds(new Set())
                            }
                          }}
                        />
                      </th>
                      {TABLE_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={cn(
                            'px-3 py-3 text-left text-sm font-semibold tracking-wide text-muted-foreground',
                            col.className,
                            col.sortField && 'cursor-pointer select-none hover:text-foreground',
                          )}
                          onClick={col.sortField ? () => handleColSort(col.key) : undefined}
                        >
                          <span className={cn('inline-flex items-center gap-1', col.headerClassName)}>
                            {col.label}
                            {col.sortField && (
                              sortColKey === col.key
                                ? sortDir === 'desc'
                                  ? <ArrowDown className="h-3 w-3 shrink-0 text-foreground" />
                                  : <ArrowUp className="h-3 w-3 shrink-0 text-foreground" />
                                : <ArrowUpDown className="h-3 w-3 shrink-0 opacity-30" />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedApplicants.map((applicant, index) => (
                      <tr
                        key={applicant.candidate_id}
                        className="group cursor-pointer transition-colors hover:bg-accent"
                        onClick={() => {
                          router.push(`/application/${applicant.candidate_id}`)
                        }}
                      >
                        <td className="px-3 py-3">
                          <Checkbox
                            checked={selectedIds.has(applicant.candidate_id)}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelection(applicant.candidate_id, index, e.shiftKey)
                            }}
                            onCheckedChange={() => {/* handled by onClick for shiftKey */}}
                          />
                        </td>
                        {TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={cn(
                              'px-3 py-3 text-sm',
                              col.className,
                            )}
                          >
                            {getCellValue(applicant, col.key, index + 1, getDecision(applicant))}
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
              {sortedApplicants.map((applicant, index) => (
                <ApplicantMobileCard
                  key={applicant.candidate_id}
                  applicant={applicant}
                  rank={index + 1}
                  isSelected={selectedIds.has(applicant.candidate_id)}
                  onToggleSelect={(e: React.MouseEvent) => toggleSelection(applicant.candidate_id, index, e.shiftKey)}
                  decision={getDecision(applicant)}
                />
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} · {filteredApplicants.length} candidates
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ---- Mobile: full-width bottom bar ---- */}
      {selectedIds.size >= 1 && (
        <div className="fixed bottom-0 right-0 left-0 z-40 border-t border-border dark:border-white/10 bg-background/90 shadow-lg backdrop-blur-sm md:hidden">
          <div className="flex flex-col gap-2.5 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {selectedIds.size} selected
              </p>
              <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground hover:text-foreground">
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="default"
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => handleBatchDecisionClick('approved')}
              >
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
              <Button
                size="default"
                className="gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
                onClick={() => handleBatchDecisionClick('shortlisted')}
              >
                <Star className="size-4" />
                Shortlist
              </Button>
              <Button
                size="default"
                className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleBatchDecisionClick('rejected')}
              >
                <XCircle className="size-4" />
                Reject
              </Button>
            </div>
            <Button
              variant="outline"
              size="default"
              className="gap-1.5"
              disabled={selectedIds.size < 2 || selectedIds.size > 3}
              onClick={handleCompare}
            >
              <ArrowLeftRight className="size-4" />
              Compare ({selectedIds.size}/3)
            </Button>
            <Button
              size="default"
              className="gap-1.5 bg-[#a6d80a] text-black hover:bg-[#95c209]"
              onClick={handleRankClick}
            >
              <Sparkles className="size-4" />
              Rank with AI
            </Button>
          </div>
        </div>
      )}

      {/* ---- Desktop: floating centered bar ---- */}
      {selectedIds.size >= 1 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 hidden justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border dark:border-white/10 bg-background/90 px-6 py-4 shadow-2xl backdrop-blur-sm">
            {/* Count */}
            <div className="border-r border-border dark:border-white/10 pr-4">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {selectedIds.size}
              </p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>

            {/* Action buttons — large */}
            <div className="flex items-center gap-2.5">
              <Button
                size="lg"
                className="gap-2 rounded-xl bg-emerald-600 px-5 text-white shadow-sm hover:bg-emerald-700"
                onClick={() => handleBatchDecisionClick('approved')}
              >
                <CheckCircle2 className="size-5" />
                Approve
              </Button>
              <Button
                size="lg"
                className="gap-2 rounded-xl bg-amber-500 px-5 text-white shadow-sm hover:bg-amber-600"
                onClick={() => handleBatchDecisionClick('shortlisted')}
              >
                <Star className="size-5" />
                Shortlist
              </Button>
              <Button
                size="lg"
                className="gap-2 rounded-xl bg-red-600 px-5 text-white shadow-sm hover:bg-red-700"
                onClick={() => handleBatchDecisionClick('rejected')}
              >
                <XCircle className="size-5" />
                Reject
              </Button>
            </div>

            <Button
              size="lg"
              className="gap-2 rounded-xl bg-[#a6d80a] px-5 text-black shadow-sm hover:bg-[#95c209]"
              onClick={handleRankClick}
            >
              <Sparkles className="size-5" />
              Rank with AI
            </Button>

            {/* Divider */}
            <div className="mx-1 h-8 w-px bg-border" />

            {/* Compare + Clear */}
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl px-5"
              disabled={selectedIds.size < 2 || selectedIds.size > 3}
              onClick={handleCompare}
              title={
                selectedIds.size < 2 || selectedIds.size > 3
                  ? 'Select 2-3 to compare'
                  : undefined
              }
            >
              <ArrowLeftRight className="size-4" />
              Compare
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="ml-1 text-muted-foreground hover:text-foreground">
              <XCircle className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Batch confirmation dialog */}
      <AlertDialog
        open={pendingBatchDecision !== null}
        onOpenChange={(open) => {
          if (!open) setPendingBatchDecision(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBatchDecision === 'approved' &&
                `Approve ${selectedIds.size} candidate${selectedIds.size !== 1 ? 's' : ''}?`}
              {pendingBatchDecision === 'rejected' &&
                `Reject ${selectedIds.size} candidate${selectedIds.size !== 1 ? 's' : ''}?`}
              {pendingBatchDecision === 'shortlisted' &&
                `Shortlist ${selectedIds.size} candidate${selectedIds.size !== 1 ? 's' : ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBatchDecision === 'approved' &&
                `Are you sure you want to approve ${selectedIds.size} candidate${selectedIds.size !== 1 ? 's' : ''}?`}
              {pendingBatchDecision === 'rejected' &&
                `Are you sure you want to reject ${selectedIds.size} candidate${selectedIds.size !== 1 ? 's' : ''}?`}
              {pendingBatchDecision === 'shortlisted' &&
                'Some selected candidates are currently rejected. Move all to shortlist?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                pendingBatchDecision === 'approved' && 'bg-emerald-600 hover:bg-emerald-700',
                pendingBatchDecision === 'rejected' && 'bg-red-600 hover:bg-red-700',
                pendingBatchDecision === 'shortlisted' && 'bg-amber-500 hover:bg-amber-600',
              )}
              onClick={confirmBatchDecision}
            >
              {pendingBatchDecision === 'approved' && 'Approve'}
              {pendingBatchDecision === 'rejected' && 'Reject'}
              {pendingBatchDecision === 'shortlisted' && 'Move to Shortlist'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
