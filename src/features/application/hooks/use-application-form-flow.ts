'use client'

import { useMemo, useState } from 'react'
import { useSubmitApplicationMutation, prepareSubmitApplicationPayload } from '../api'
import {
  applicationSubmitSchema,
  contactTabSchema,
  educationTabSchema,
  motivationTabSchema,
  personalTabSchema,
} from '../schemas'
import type { ApplicationFormData, ApplicationTab } from '../types'

interface UseApplicationFormFlowParams {
  data: ApplicationFormData
  activeTab: ApplicationTab
  setActiveTab: (tab: ApplicationTab) => void
  tabs: ReadonlyArray<{ value: ApplicationTab }>
}

export function useApplicationFormFlow({
  data,
  activeTab,
  setActiveTab,
  tabs,
}: UseApplicationFormFlowParams) {
  const [touchedTabs, setTouchedTabs] = useState<Record<ApplicationTab, boolean>>({
    personal: true,
    contact: false,
    education: false,
    motivation: false,
  })
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null)

  const submitMutation = useSubmitApplicationMutation()

  const tabValidation = useMemo(() => {
    const personalValid = personalTabSchema.safeParse({
      personalInformation: data.personalInformation,
      familyDetails: data.familyDetails,
    }).success

    const contactValid = contactTabSchema.safeParse({
      contactInformation: data.contactInformation,
    }).success

    const educationValid = educationTabSchema.safeParse({
      education: data.education,
    }).success

    const motivationValid = motivationTabSchema.safeParse({
      motivation: data.motivation,
    }).success

    return {
      personal: personalValid,
      contact: contactValid,
      education: educationValid,
      motivation: motivationValid,
    }
  }, [data])

  const currentIndex = tabs.findIndex((tab) => tab.value === activeTab)
  const isFirstTab = currentIndex <= 0
  const isLastTab = currentIndex === tabs.length - 1

  const clearSubmissionStatus = () => {
    setSubmissionError(null)
    setSubmissionSuccess(null)
  }

  const markTabTouched = (tab: ApplicationTab) => {
    setTouchedTabs((prev) => ({ ...prev, [tab]: true }))
  }

  const handleTabChange = (nextTab: ApplicationTab) => {
    setTouchedTabs((prev) => ({
      ...prev,
      [activeTab]: true,
      [nextTab]: true,
    }))
    setActiveTab(nextTab)
  }

  const handleNextStep = () => {
    markTabTouched(activeTab)

    if (isLastTab) {
      return
    }

    setActiveTab(tabs[currentIndex + 1].value)
    clearSubmissionStatus()
  }

  const handleBackStep = () => {
    markTabTouched(activeTab)

    if (isFirstTab) {
      return
    }

    setActiveTab(tabs[currentIndex - 1].value)
    clearSubmissionStatus()
  }

  const handleSubmitApplication = async () => {
    clearSubmissionStatus()

    setTouchedTabs({
      personal: true,
      contact: true,
      education: true,
      motivation: true,
    })

    if (!data.program) {
      setSubmissionError('Please select a program before sending the application.')
      return
    }

    const fullValidation = applicationSubmitSchema.safeParse({
      program: data.program,
      personalInformation: data.personalInformation,
      familyDetails: data.familyDetails,
      contactInformation: data.contactInformation,
      education: data.education,
      motivation: data.motivation,
      agreements: data.agreements,
    })

    if (!fullValidation.success) {
      const firstInvalidTab = (tabs.map((tab) => tab.value) as ApplicationTab[]).find(
        (tab) => !tabValidation[tab],
      )

      if (firstInvalidTab) {
        setActiveTab(firstInvalidTab)
      }

      setSubmissionError('Please fill all required fields correctly before submitting.')
      return
    }

    try {
      const payload = prepareSubmitApplicationPayload(data)
      await submitMutation.mutateAsync(payload)
      setSubmissionSuccess('Application has been sent successfully.')
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'Failed to send application. Please try again.',
      )
    }
  }

  return {
    touchedTabs,
    tabValidation,
    submissionError,
    submissionSuccess,
    isSubmitting: submitMutation.isPending,
    isFirstTab,
    isLastTab,
    handleTabChange,
    handleNextStep,
    handleBackStep,
    handleSubmitApplication,
  }
}
