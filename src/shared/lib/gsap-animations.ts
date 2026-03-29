import gsap from 'gsap'

interface PageIntroOptions {
  sectionSelector?: string
  itemSelector?: string
  sectionDuration?: number
  itemDuration?: number
  sectionStagger?: number
  itemStagger?: number
}

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const runPageIntroAnimation = (
  scope: HTMLElement,
  {
    sectionSelector = '[data-animate-section]',
    itemSelector = '[data-animate-item]',
    sectionDuration = 0.8,
    itemDuration = 0.7,
    sectionStagger = 0.1,
    itemStagger = 0.08,
  }: PageIntroOptions = {},
) => {
  if (prefersReducedMotion()) {
    return null
  }

  const sectionTargets = scope.querySelectorAll(sectionSelector)
  const itemTargets = scope.querySelectorAll(itemSelector)

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

  if (sectionTargets.length > 0) {
    timeline.fromTo(
      sectionTargets,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: sectionDuration,
        stagger: sectionStagger,
        clearProps: 'opacity,visibility,transform',
      },
    )
  }

  if (itemTargets.length > 0) {
    timeline.fromTo(
      itemTargets,
      { autoAlpha: 0, y: 16, scale: 0.98 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: itemDuration,
        stagger: itemStagger,
        clearProps: 'opacity,visibility,transform',
      },
      sectionTargets.length > 0 ? '-=0.45' : 0,
    )
  }

  return timeline
}
