'use client'

import { useEffect, useRef, useState } from 'react'
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
  const tabNavigationRef = useRef<HTMLDivElement | null>(null)
  const isFirstRenderRef = useRef(true)
  const {
    touchedTabs,
    tabValidation,
    submissionError,
    submissionSuccess,
    isSubmitting,
    isFirstTab,
    isLastTab,
    handleTabChange,
    handleNextStep,
    handleBackStep,
    handleSubmitApplication,
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

  return (
    <div className="bg-accent-1 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ApplicationFormHeader
          program={data.program}
          status={data.status}
          onOpenProgramDialog={() => setProgramDialogOpen(true)}
        />

        <div className="border-border bg-card rounded-2xl border shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value as ApplicationTab)}
            className="w-full gap-0"
          >
            <div ref={tabNavigationRef}>
              <ApplicationTabsNavigation
                tabs={TABS}
                touchedTabs={touchedTabs}
                tabValidation={tabValidation}
              />
            </div>

            <div className="p-4 sm:p-6">
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
            submissionSuccess={submissionSuccess}
          />

          <ApplicationFooterActions
            isFirstTab={isFirstTab}
            isLastTab={isLastTab}
            isSubmitting={isSubmitting}
            onBack={handleBackStep}
            onNext={handleNextStep}
            onSubmit={handleSubmitApplication}
          />
        </div>
      </div>

      {/* ═══ Program Selector Modal ═══ */}
      <ProgramSelectorDialog
        open={programDialogOpen}
        onOpenChange={setProgramDialogOpen}
        currentProgram={data.program}
        onSelect={setProgram}
      />
    </div>
  )
}
