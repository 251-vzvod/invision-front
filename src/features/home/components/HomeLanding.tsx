'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Activity,
  ArrowRight,
  Eye,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { Button } from '@/shared/ui/button'

gsap.registerPlugin(ScrollTrigger)

/* ────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Activity,
    title: 'Smart Scoring',
    description:
      'AI evaluates candidates across merit, motivation, leadership, and trust dimensions.',
  },
  {
    icon: Eye,
    title: 'Explainable AI',
    description:
      'Every score comes with evidence spans, review flags, and scoring notes.',
  },
  {
    icon: Users,
    title: 'Human in the Loop',
    description:
      'Committee makes the final call. AI provides insights, not decisions.',
  },
] as const

const STEPS = [
  {
    number: 1,
    title: 'Apply',
    description:
      'Candidates submit applications, essays, and video presentations',
  },
  {
    number: 2,
    title: 'Analyze',
    description:
      'AI engine scores across 22+ quality signals and 5 merit dimensions',
  },
  {
    number: 3,
    title: 'Review',
    description:
      'Committee reviews ranked candidates with full transparency',
  },
] as const

const STATS = [
  { value: 5, suffix: '', label: 'Merit Dimensions' },
  { value: 22, suffix: '+', label: 'Quality Signals' },
  { value: 100, suffix: '%', label: 'Explainable Scores' },
  { value: 0, suffix: '', label: 'Autonomous Rejections' },
] as const

/* ────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────── */

export function HomeLanding() {
  const rootRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const featuresRef = useRef<HTMLElement | null>(null)
  const stepsRef = useRef<HTMLElement | null>(null)
  const statsRef = useRef<HTMLElement | null>(null)
  const ctaRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      /* ── Hero intro timeline ── */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      heroTl
        .fromTo(
          '[data-hero-badge]',
          { autoAlpha: 0, y: 20, filter: 'blur(4px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
        )
        .fromTo(
          '[data-hero-heading]',
          { autoAlpha: 0, y: 30, filter: 'blur(6px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero-subtitle]',
          { autoAlpha: 0, y: 20, filter: 'blur(4px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7 },
          '-=0.4',
        )
        .fromTo(
          '[data-hero-btn]',
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'back.out(1.2)',
          },
          '-=0.3',
        )

      /* ── Floating cards ── */
      gsap.fromTo(
        '[data-float-card]',
        { autoAlpha: 0, y: 40, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.6,
        },
      )

      document.querySelectorAll('[data-float-card]').forEach((card, i) => {
        gsap.to(card, {
          y: i % 2 === 0 ? -8 : 8,
          duration: 2.5 + i * 0.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      /* ── Features section ── */
      gsap.fromTo(
        '[data-features-title]',
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '[data-feature-card]',
        { autoAlpha: 0, y: 40, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      /* ── Steps section ── */
      gsap.fromTo(
        '[data-steps-title]',
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      const stepsTl = gsap.timeline({
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 75%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      })

      stepsTl.fromTo(
        '[data-step-item]',
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.2 },
      )

      stepsTl.fromTo(
        '[data-step-number]',
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: 'back.out(1.4)',
        },
        0,
      )

      stepsTl.fromTo(
        '[data-step-line]',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, stagger: 0.2, ease: 'power2.out' },
        0.3,
      )

      /* ── Stats section counter animation ── */
      const statEls = document.querySelectorAll<HTMLElement>('[data-stat-value]')

      statEls.forEach((el) => {
        const target = Number(el.dataset.statValue)
        const suffix = el.dataset.statSuffix ?? ''
        const obj = { value: 0 }

        gsap.to(obj, {
          value: target,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            once: true,
          },
          onUpdate() {
            el.textContent = `${Math.round(obj.value)}${suffix}`
          },
        })
      })

      gsap.fromTo(
        '[data-stat-item]',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      /* ── CTA section ── */
      gsap.fromTo(
        '[data-cta-content]',
        { autoAlpha: 0, y: 30, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={rootRef} className="bg-dashboard overflow-x-hidden">
      {/* ═══════ Section 1: Hero ═══════ */}
      <section
        ref={heroRef}
        className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="relative z-10 text-center">
          <p
            data-hero-badge
            className="invisible mb-6 inline-flex items-center gap-2 rounded-full border border-accent-6/30 bg-accent-1 px-4 py-1.5 text-sm font-medium text-accent-8"
          >
            <Sparkles className="size-4" />
            AI-Powered Admissions Platform
          </p>

          <h1
            data-hero-heading
            className="invisible mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-accent-8 via-accent-6 to-accent-9 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            Admissions
          </h1>

          <p
            data-hero-subtitle
            className="invisible mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Intelligent candidate screening for inVision U. Evaluate talent,
            not just applications.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="invisible h-12 gap-2 px-6 text-base font-semibold"
              data-hero-btn
            >
              <Link href="/form">
                Apply Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="invisible h-12 gap-2 px-6 text-base font-semibold"
              data-hero-btn
            >
              <Link href="/applicants">Manager Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Floating glassmorphism cards */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            data-float-card
            className="invisible absolute left-[5%] top-[18%] rounded-2xl border border-white/40 bg-white/60 px-5 py-3.5 shadow-lg backdrop-blur-md sm:left-[8%]"
          >
            <p className="text-sm font-semibold text-foreground">
              8+ Merit Dimensions
            </p>
          </div>
          <div
            data-float-card
            className="invisible absolute right-[5%] top-[25%] rounded-2xl border border-white/40 bg-white/60 px-5 py-3.5 shadow-lg backdrop-blur-md sm:right-[10%]"
          >
            <p className="text-sm font-semibold text-foreground">
              AI Scoring Engine
            </p>
          </div>
          <div
            data-float-card
            className="invisible absolute bottom-[22%] left-[12%] rounded-2xl border border-white/40 bg-white/60 px-5 py-3.5 shadow-lg backdrop-blur-md sm:left-[15%]"
          >
            <p className="text-sm font-semibold text-foreground">
              Real-time Analysis
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ Section 2: Features ═══════ */}
      <section
        ref={featuresRef}
        className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <h2
          data-features-title
          className="invisible mb-14 text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          What InVision Offers
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              data-feature-card
              className="invisible rounded-2xl border border-border/60 bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-accent-2 text-accent-7">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ Section 3: How it works ═══════ */}
      <section
        ref={stepsRef}
        className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <h2
          data-steps-title
          className="invisible mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          How It Works
        </h2>

        <div className="relative flex flex-col items-start gap-12 md:flex-row md:items-center md:justify-between md:gap-0">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {/* Connecting line (between steps, not after last) */}
              {i < STEPS.length - 1 && (
                <div
                  data-step-line
                  className="absolute left-[calc(50%+2rem)] top-6 hidden h-0.5 origin-left bg-accent-5 md:block"
                  style={{ width: 'calc(100% - 4rem)' }}
                />
              )}

              <div data-step-item className="invisible relative z-10">
                <div
                  data-step-number
                  className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-accent-6 text-lg font-bold text-white"
                >
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="max-w-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ Section 4: Stats ═══════ */}
      <section
        ref={statsRef}
        className="bg-accent-1/60 py-24 backdrop-blur-sm"
      >
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              data-stat-item
              className="invisible flex flex-col items-center text-center"
            >
              <span
                data-stat-value={stat.value}
                data-stat-suffix={stat.suffix}
                className="text-4xl font-bold text-accent-8 sm:text-5xl"
              >
                0
              </span>
              <span className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ Section 5: CTA / Footer ═══════ */}
      <section
        ref={ctaRef}
        className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <div
          data-cta-content
          className="invisible flex flex-col items-center text-center"
        >
          <Shield className="mb-4 size-10 text-accent-6" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Admissions?
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Join inVision U in building a fairer, faster, and fully
            transparent admissions process.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 px-6 text-base font-semibold"
            >
              <Link href="/form">
                Apply Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base font-semibold"
            >
              <Link href="/applicants">Manager Dashboard</Link>
            </Button>
          </div>
        </div>

        <footer className="mt-20 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          Built for inVision U &mdash; Decentrathon 5.0
        </footer>
      </section>
    </main>
  )
}
