'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Menu, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/shared/stores/theme-store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import type { CodeLanguage, HttpMethod } from '../types'
import { endpointGroups } from '../data/endpoints'
import { EndpointCard } from './endpoint-card'

const methodDotColors: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500',
  POST: 'bg-sky-500',
  PUT: 'bg-amber-500',
  DELETE: 'bg-red-500',
}

const DEFAULT_BASE_URL = 'https://fortehack.digital'

export function ApiDocumentation() {
  const { theme, toggleTheme } = useThemeStore()
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [language, setLanguage] = useState<CodeLanguage>('curl')
  const [activeId, setActiveId] = useState<string>('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which endpoint is in view
  useEffect(() => {
    const ids = endpointGroups.flatMap((g) => g.endpoints.map((e) => e.id))

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [])

  const scrollToEndpoint = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
    setMobileNavOpen(false)
  }, [])

  const sidebarContent = useMemo(
    () => (
      <nav className="space-y-5">
        {endpointGroups.map((group) => (
          <div key={group.tag}>
            <h3 className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {group.tag}
            </h3>
            <ul className="space-y-0.5">
              {group.endpoints.map((endpoint) => (
                <li key={endpoint.id}>
                  <button
                    type="button"
                    onClick={() => scrollToEndpoint(endpoint.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                      activeId === endpoint.id
                        ? 'bg-primary/10 text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        methodDotColors[endpoint.method],
                      )}
                    />
                    <span className="truncate">{endpoint.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    ),
    [activeId, scrollToEndpoint],
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ─── Top bar ─── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border dark:border-white/8">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          {/* Mobile menu trigger */}
          <div className="lg:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon-sm" className="border-border dark:border-white/10">
                  <Menu className="size-4" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-border dark:border-white/10 bg-background overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">API Endpoints</SheetTitle>
                  <SheetDescription className="sr-only">Navigate to API endpoints</SheetDescription>
                </SheetHeader>
                <div className="mt-4">{sidebarContent}</div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo.svg" alt="InVision" width={80} height={40} priority className="h-auto w-[80px]" />
          </Link>

          <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground">
            <BookOpen className="size-4 text-primary" />
            API Documentation
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Base URL input */}
          <div className="hidden md:flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Base URL</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-8 w-64 font-mono text-xs"
              placeholder="http://localhost:8000"
            />
          </div>

          {/* Theme toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>

        {/* Mobile base URL */}
        <div className="md:hidden flex items-center gap-2 px-4 pb-3">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Base URL</label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="h-8 flex-1 font-mono text-xs"
            placeholder="http://localhost:8000"
          />
        </div>

        <div className="h-[1px] bg-gradient-to-r from-primary via-primary/30 to-transparent" />
      </header>

      {/* ─── Main content ─── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-[57px] h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-border dark:border-white/8 p-4">
          {sidebarContent}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
            {/* Hero */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                InVision API
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                Complete API reference for the InVision U candidate screening system. Manage application
                forms, upload files to S3 storage, interact with the AI evaluation agent, and monitor
                server health.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  OpenAPI 3.1
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v0.1.0
                </Badge>
              </div>
            </div>

            {/* Endpoint groups */}
            {endpointGroups.map((group) => (
              <section key={group.tag} className="space-y-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">{group.tag}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                </div>
                <div className="space-y-5">
                  {group.endpoints.map((endpoint) => (
                    <EndpointCard
                      key={endpoint.id}
                      endpoint={endpoint}
                      baseUrl={baseUrl}
                      language={language}
                      onLanguageChange={setLanguage}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Footer */}
            <div className="border-t border-border dark:border-white/8 pt-6 pb-12 text-center">
              <p className="text-xs text-muted-foreground">
                InVision U API Documentation &middot; Built for Decentrathon 5.0
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
