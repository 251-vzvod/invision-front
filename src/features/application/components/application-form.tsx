'use client'

import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { runPageIntroAnimation, prefersReducedMotion } from '@/shared/lib/gsap-animations'
import { useThemeStore } from '@/shared/stores/theme-store'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent } from '@/shared/ui/tabs'
import { useApplicationFormStore } from '../hooks/use-application-form'
import { useApplicationFormFlow } from '../hooks/use-application-form-flow'
import { PersonalInformationForm } from './personal-information-form'
import { ContactInformationForm } from './contact-information-form'
import { EducationForm } from './education-form'
import { MotivationForm } from './motivation-form'
import { ProgramSelectorDialog } from './program-selector-dialog'
import { ApplicationFormHeader } from './application-form-header'
import { ApplicationTabsNavigation } from './application-tabs-navigation'
import { ApplicationAgreementsSection } from './application-agreements-section'
import { ApplicationFooterActions } from './application-footer-actions'
import { InternalTestIntro } from './internal-test-intro'
import { InternalTestChat } from './internal-test-chat'
import { InternalTestFinished } from './internal-test-finished'
import type { ApplicationTab } from '../types'

const TABS: { value: ApplicationTab; label: string; disabled?: boolean }[] = [
  { value: 'personal', label: 'Personal Information' },
  { value: 'contact', label: 'Contact Information' },
  { value: 'education', label: 'Education' },
  { value: 'motivation', label: 'Motivation' },
]

function ProgressBar({ activeTab }: { activeTab: ApplicationTab }) {
  const progressMap: Record<ApplicationTab, number> = {
    personal: 25,
    contact: 50,
    education: 75,
    motivation: 100,
  }
  const percent = progressMap[activeTab] ?? 0

  return (
    <div className="bg-muted/70 h-1 w-full rounded-full dark:bg-white/15">
      <div
        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function ApplicationForm() {
  const { data, activeTab, setActiveTab, setProgram, setAgreements } = useApplicationFormStore()
  const { theme, toggleTheme } = useThemeStore()
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const tabNavigationRef = useRef<HTMLDivElement | null>(null)
  const formContentRef = useRef<HTMLDivElement | null>(null)
  const isFirstRenderRef = useRef(true)
  const {
    viewMode,
    chatHistory,
    chatError,
    touchedTabs,
    tabValidation,
    activeTabErrors,
    stepNavigationWarning,
    submissionError,
    isSubmitting,
    isChatSubmitting,
    isFirstTab,
    isLastTab,
    handleTabChange,
    handleNextStep,
    handleBackStep,
    handleSubmitApplication,
    handleStartInternalTest,
    handleSendChatMessage,
  } = useApplicationFormFlow({
    data,
    activeTab,
    setActiveTab,
    tabs: TABS,
  })

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    tabNavigationRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [activeTab])

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const context = gsap.context(() => {
      runPageIntroAnimation(root, {
        sectionSelector: '[data-animate-form-section]',
        itemSelector: '[data-animate-form-item]',
      })
    }, root)

    return () => {
      context.revert()
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) {
      return
    }

    const formContent = formContentRef.current

    if (!formContent || viewMode !== 'form') {
      return
    }

    gsap.fromTo(
      formContent,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
      },
    )
  }, [activeTab, viewMode])

  return (
    <div ref={rootRef} className="bg-dashboard relative min-h-screen">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="border-border bg-background/80 text-muted-foreground hover:text-foreground absolute top-4 right-4 z-30 size-9 rounded-lg p-0 backdrop-blur dark:border-white/10"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <div data-animate-form-section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <ApplicationFormHeader
          viewMode={viewMode}
          program={data.program}
          status={data.status}
          onOpenProgramDialog={() => setProgramDialogOpen(true)}
        />

        <div
          data-animate-form-section
          className="border-border bg-card rounded-xl border dark:border-white/10 dark:bg-white/[0.08] dark:backdrop-blur-2xl"
        >
          {viewMode === 'form' ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={(value) => handleTabChange(value as ApplicationTab)}
                className="w-full gap-0"
              >
                <div
                  ref={tabNavigationRef}
                  className="border-border bg-background/90 sticky top-0 z-40 overflow-hidden rounded-t-xl border-b backdrop-blur-2xl dark:border-white/10 dark:bg-[#131c10]/90"
                >
                  <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
                    <ProgressBar activeTab={activeTab} />
                  </div>
                  <ApplicationTabsNavigation
                    tabs={TABS}
                    touchedTabs={touchedTabs}
                    tabValidation={tabValidation}
                  />
                </div>

                <div ref={formContentRef} data-animate-form-item className="p-4 sm:p-6">
                  {(stepNavigationWarning ||
                    (touchedTabs[activeTab] && activeTabErrors.length > 0)) && (
                    <div className="border-destructive/25 bg-destructive/10 mb-5 rounded-xl border px-4 py-3">
                      <p className="text-destructive text-sm font-medium">
                        {stepNavigationWarning ??
                          'Please fix the highlighted fields in this section.'}
                      </p>
                      {activeTabErrors.length > 0 && (
                        <ul className="text-destructive/90 mt-2 space-y-1 text-sm">
                          {activeTabErrors.map((error) => (
                            <li key={`${error.field}:${error.message}`}>
                              • {error.field}: {error.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <TabsContent value="personal" className="mt-0">
                    <PersonalInformationForm />
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0">
                    <ContactInformationForm />
                  </TabsContent>

                  <TabsContent value="education" className="mt-0">
                    <EducationForm />
                  </TabsContent>

                  <TabsContent value="motivation" className="mt-0">
                    <MotivationForm />
                  </TabsContent>
                </div>
              </Tabs>

              <ApplicationAgreementsSection
                agreements={data.agreements}
                onChange={setAgreements}
                submissionError={submissionError}
              />

              <ApplicationFooterActions
                isFirstTab={isFirstTab}
                isLastTab={isLastTab}
                isSubmitting={isSubmitting}
                onBack={handleBackStep}
                onNext={handleNextStep}
                onSubmit={handleSubmitApplication}
              />
            </>
          ) : null}

          {viewMode === 'testIntro' ? (
            <InternalTestIntro
              onStart={handleStartInternalTest}
              isStarting={isChatSubmitting}
              error={chatError}
            />
          ) : null}

          {viewMode === 'testChat' ? (
            <InternalTestChat
              history={chatHistory}
              isLoading={isChatSubmitting}
              error={chatError}
              onSend={handleSendChatMessage}
            />
          ) : null}

          {viewMode === 'testFinished' ? <InternalTestFinished history={chatHistory} /> : null}
        </div>
      </div>

      {viewMode === 'form' ? (
        <ProgramSelectorDialog
          open={programDialogOpen}
          onOpenChange={setProgramDialogOpen}
          currentProgram={data.program}
          onSelect={setProgram}
        />
      ) : null}
    </div>
  )
}
