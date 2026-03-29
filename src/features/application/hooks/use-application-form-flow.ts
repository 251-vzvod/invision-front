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
import { MOTIVATION_QUESTIONS } from '../constants'
import type { ApplicationFormData, ApplicationTab } from '../types'

interface TabFieldError {
  field: string
  message: string
}

const TAB_LABELS: Record<ApplicationTab, string> = {
  personal: 'Personal information',
  contact: 'Contact information',
  education: 'Education',
  motivation: 'Motivation',
}

const TAB_FIELD_LABELS: Record<ApplicationTab, Record<string, string>> = {
  personal: {
    'personalInformation.firstName': 'First Name',
    'personalInformation.lastName': 'Last Name',
    'personalInformation.patronymic': 'Patronymic',
    'personalInformation.birthDate': 'Date of Birth',
    'personalInformation.gender': 'Gender',
    'personalInformation.citizenship': 'Citizenship',
    'personalInformation.iin': 'Individual Identification Number (IIN)',
    'personalInformation.document.type': 'Document Type',
    'personalInformation.document.number': 'Document Number',
    'personalInformation.document.issuedBy': 'Issued By',
    'personalInformation.document.issueDate': 'Issue Date',
    'familyDetails.father.firstName': 'Father First Name',
    'familyDetails.father.lastName': 'Father Last Name',
    'familyDetails.father.patronymic': 'Father Patronymic',
    'familyDetails.father.phone': 'Father Phone',
    'familyDetails.mother.firstName': 'Mother First Name',
    'familyDetails.mother.lastName': 'Mother Last Name',
    'familyDetails.mother.patronymic': 'Mother Patronymic',
    'familyDetails.mother.phone': 'Mother Phone',
    'familyDetails.guardian.firstName': 'Guardian First Name',
    'familyDetails.guardian.lastName': 'Guardian Last Name',
    'familyDetails.guardian.patronymic': 'Guardian Patronymic',
    'familyDetails.guardian.phone': 'Guardian Phone',
  },
  contact: {
    'contactInformation.address.country': 'Country',
    'contactInformation.address.region': 'Region',
    'contactInformation.address.city': 'City',
    'contactInformation.address.street': 'Street',
    'contactInformation.address.house': 'House',
    'contactInformation.address.flat': 'Apartment',
    'contactInformation.contacts.phone': 'Mobile Phone Number',
    'contactInformation.contacts.whatsapp': 'WhatsApp',
    'contactInformation.contacts.instagram': 'Instagram',
    'contactInformation.contacts.telegram': 'Telegram',
  },
  education: {
    'education.videoPresentationLink': 'Presentation Link',
    'education.englishProficiency.type': 'English Exam Type',
    'education.englishProficiency.score': 'English Exam Score',
    'education.schoolCertificate.type': 'School Certificate Type',
    'education.schoolCertificate.score': 'UNT Score',
  },
  motivation: {
    'motivation.motivationLetter.fileName': 'Motivation Letter File',
    'motivation.motivationLetter.mimeType': 'Motivation Letter File Type',
    'motivation.motivationLetter.base64': 'Motivation Letter Content',
    'motivation.motivationLetter.size': 'Motivation Letter Size',
    'motivation.motivationLetter.lastModified': 'Motivation Letter Metadata',
    'motivation.motivationQuestions': 'Motivation Questions',
  },
}

const MOTIVATION_QUESTION_LABELS = MOTIVATION_QUESTIONS.reduce<Record<string, string>>(
  (acc, question, index) => {
    acc[question.id] = `Question ${index + 1}`
    return acc
  },
  {},
)

function toPathKey(path: ReadonlyArray<string | number | symbol>) {
  return path.map((segment) => String(segment)).join('.')
}

function humanizePath(pathKey: string) {
  if (!pathKey) {
    return 'Field'
  }

  const lastSegment = pathKey.split('.').pop() ?? pathKey
  return lastSegment
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
}

function mapTabIssuesToFieldErrors(
  tab: ApplicationTab,
  issues: ReadonlyArray<{ path: ReadonlyArray<string | number | symbol>; message: string }>,
): TabFieldError[] {
  const dedupe = new Set<string>()

  return issues.reduce<TabFieldError[]>((acc, issue) => {
    const pathKey = toPathKey(issue.path)
    let field = TAB_FIELD_LABELS[tab][pathKey] ?? humanizePath(pathKey)

    if (tab === 'motivation' && pathKey.startsWith('motivation.motivationQuestions.')) {
      const questionId = pathKey.split('.').at(-1) ?? ''
      field = MOTIVATION_QUESTION_LABELS[questionId] ?? `Motivation Question (${questionId})`
    }

    const dedupeKey = `${field}:${issue.message}`
    if (dedupe.has(dedupeKey)) {
      return acc
    }

    dedupe.add(dedupeKey)
    acc.push({
      field,
      message: issue.message,
    })
    return acc
  }, [])
}

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
  const [stepNavigationWarning, setStepNavigationWarning] = useState<string | null>(null)

  const submitMutation = useSubmitApplicationMutation()

  const tabValidationState = useMemo(() => {
    const personalResult = personalTabSchema.safeParse({
      personalInformation: data.personalInformation,
      familyDetails: data.familyDetails,
    })

    const contactResult = contactTabSchema.safeParse({
      contactInformation: data.contactInformation,
    })

    const educationResult = educationTabSchema.safeParse({
      education: data.education,
    })

    const motivationResult = motivationTabSchema.safeParse({
      motivation: data.motivation,
    })

    return {
      tabValidation: {
        personal: personalResult.success,
        contact: contactResult.success,
        education: educationResult.success,
        motivation: motivationResult.success,
      },
      tabErrors: {
        personal: personalResult.success
          ? []
          : mapTabIssuesToFieldErrors('personal', personalResult.error.issues),
        contact: contactResult.success
          ? []
          : mapTabIssuesToFieldErrors('contact', contactResult.error.issues),
        education: educationResult.success
          ? []
          : mapTabIssuesToFieldErrors('education', educationResult.error.issues),
        motivation: motivationResult.success
          ? []
          : mapTabIssuesToFieldErrors('motivation', motivationResult.error.issues),
      },
    }
  }, [data])

  const { tabValidation, tabErrors } = tabValidationState

  const currentIndex = tabs.findIndex((tab) => tab.value === activeTab)
  const isFirstTab = currentIndex <= 0
  const isLastTab = currentIndex === tabs.length - 1

  const clearSubmissionStatus = () => {
    setSubmissionError(null)
    setSubmissionSuccess(null)
  }

  const clearStepNavigationWarning = () => {
    setStepNavigationWarning(null)
  }

  const markTabTouched = (tab: ApplicationTab) => {
    setTouchedTabs((prev) => ({ ...prev, [tab]: true }))
  }

  const handleTabChange = (nextTab: ApplicationTab) => {
    markTabTouched(activeTab)

    if (nextTab === activeTab) {
      return
    }

    if (!tabValidation[activeTab]) {
      setStepNavigationWarning(
        `Fix invalid fields in ${TAB_LABELS[activeTab]} before moving to another step.`,
      )
    } else {
      clearStepNavigationWarning()
    }

    setTouchedTabs((prev) => ({
      ...prev,
      [nextTab]: true,
    }))
    clearSubmissionStatus()
    setActiveTab(nextTab)
  }

  const handleNextStep = () => {
    markTabTouched(activeTab)

    if (!tabValidation[activeTab]) {
      setStepNavigationWarning(
        `Fix invalid fields in ${TAB_LABELS[activeTab]} before moving to another step.`,
      )
    } else {
      clearStepNavigationWarning()
    }

    if (isLastTab) {
      return
    }

    setActiveTab(tabs[currentIndex + 1].value)
    clearSubmissionStatus()
  }

  const handleBackStep = () => {
    markTabTouched(activeTab)

    if (!tabValidation[activeTab]) {
      setStepNavigationWarning(
        `Fix invalid fields in ${TAB_LABELS[activeTab]} before moving to another step.`,
      )
    } else {
      clearStepNavigationWarning()
    }

    if (isFirstTab) {
      return
    }

    setActiveTab(tabs[currentIndex - 1].value)
    clearSubmissionStatus()
  }

  const handleSubmitApplication = async () => {
    clearSubmissionStatus()
    clearStepNavigationWarning()

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
    tabErrors,
    activeTabErrors: tabErrors[activeTab],
    stepNavigationWarning,
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
