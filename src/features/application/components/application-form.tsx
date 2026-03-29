'use client'

import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { runPageIntroAnimation, prefersReducedMotion } from '@/shared/lib/gsap-animations'
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

export function ApplicationForm() {
  const { data, activeTab, setActiveTab, setProgram, setAgreements } = useApplicationFormStore()
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
    <div ref={rootRef} className="bg-accent-1 min-h-screen">
      <div data-animate-form-section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ApplicationFormHeader
          viewMode={viewMode}
          program={data.program}
          status={data.status}
          onOpenProgramDialog={() => setProgramDialogOpen(true)}
        />

        <div
          data-animate-form-section
          className="border-border bg-card rounded-2xl border shadow-sm"
        >
          {viewMode === 'form' ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={(value) => handleTabChange(value as ApplicationTab)}
                className="w-full gap-0"
              >
                <div ref={tabNavigationRef} className="sticky top-0 z-40">
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
