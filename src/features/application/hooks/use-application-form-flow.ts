'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useAgentChatMutation,
  useSubmitApplicationMutation,
  prepareSubmitApplicationPayload,
} from '../api'
import type { AgentReplyResponse } from '../api'
import {
  applicationSubmitSchema,
  contactTabSchema,
  educationTabSchema,
  motivationTabSchema,
  personalTabSchema,
} from '../schemas'
import type {
  ApplicationFormData,
  ApplicationTab,
  ApplicationViewMode,
  ChatMessage,
} from '../types'

/* ─── localStorage helpers for applicant ID and chat history ─── */

const APPLICANT_ID_KEY = 'invision_applicant_id'
const CHAT_HISTORY_KEY_PREFIX = 'invision_chat_history_'

const persistApplicantId = (id: number) => {
  localStorage.setItem(APPLICANT_ID_KEY, String(id))
}

const getPersistedApplicantId = (): number | null => {
  const raw = localStorage.getItem(APPLICANT_ID_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const getChatHistoryKey = (applicantId: number) =>
  `${CHAT_HISTORY_KEY_PREFIX}${applicantId}`

const persistChatHistory = (applicantId: number, history: ChatMessage[]) => {
  localStorage.setItem(getChatHistoryKey(applicantId), JSON.stringify(history))
}

const getPersistedChatHistory = (applicantId: number): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(getChatHistoryKey(applicantId))
    if (!raw) return []
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

/* ─── Tab validation helpers ─── */

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
  },
  contact: {
    'contactInformation.contacts.phone': 'Mobile Phone Number',
    'contactInformation.contacts.whatsapp': 'WhatsApp',
    'contactInformation.contacts.instagram': 'Instagram',
    'contactInformation.contacts.telegram': 'Telegram',
  },
  education: {
    'education.englishProficiency.type': 'English Exam Type',
    'education.englishProficiency.score': 'English Exam Score',
    'education.schoolCertificate.type': 'School Certificate Type',
    'education.schoolCertificate.score': 'UNT Score',
  },
  motivation: {
    'motivation.presentationLink': 'Presentation Link',
    'motivation.motivationLetter.fileUrl': 'Motivation Letter URL',
    'motivation.motivationLetter.fileName': 'Motivation Letter File',
    'motivation.motivationLetter.mimeType': 'Motivation Letter File Type',
    'motivation.motivationLetter.size': 'Motivation Letter Size',
  },
}

function toPathKey(path: ReadonlyArray<string | number | symbol>) {
  return path.map((segment) => String(segment)).join('.')
}

function humanizePath(pathKey: string) {
  if (!pathKey) return 'Field'
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
    const field = TAB_FIELD_LABELS[tab][pathKey] ?? humanizePath(pathKey)

    const dedupeKey = `${field}:${issue.message}`
    if (dedupe.has(dedupeKey)) return acc

    dedupe.add(dedupeKey)
    acc.push({ field, message: issue.message })
    return acc
  }, [])
}

/* ─── Main hook ─── */

interface UseApplicationFormFlowParams {
  data: ApplicationFormData
  activeTab: ApplicationTab
  setActiveTab: (tab: ApplicationTab) => void
  tabs: ReadonlyArray<{ value: ApplicationTab }>
}

const agentResponseToMessages = (response: AgentReplyResponse): ChatMessage[] => {
  if (!response.message) return []
  return [{ sender: 'agent', text: response.message }]
}

export function useApplicationFormFlow({
  data,
  activeTab,
  setActiveTab,
  tabs,
}: UseApplicationFormFlowParams) {
  const [viewMode, setViewMode] = useState<ApplicationViewMode>('form')
  const [applicantId, setApplicantId] = useState<number | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatError, setChatError] = useState<string | null>(null)
  const [touchedTabs, setTouchedTabs] = useState<Record<ApplicationTab, boolean>>({
    personal: true,
    contact: false,
    education: false,
    motivation: false,
  })
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [stepNavigationWarning, setStepNavigationWarning] = useState<string | null>(null)

  const submitMutation = useSubmitApplicationMutation()
  const chatMutation = useAgentChatMutation()

  // Persist chat history whenever it changes
  useEffect(() => {
    if (applicantId && chatHistory.length > 0) {
      persistChatHistory(applicantId, chatHistory)
    }
  }, [applicantId, chatHistory])

  const tabValidationState = useMemo(() => {
    const personalResult = personalTabSchema.safeParse({
      personalInformation: data.personalInformation,
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

  const clearSubmissionStatus = () => setSubmissionError(null)
  const clearStepNavigationWarning = () => setStepNavigationWarning(null)

  const markTabTouched = (tab: ApplicationTab) => {
    setTouchedTabs((prev) => ({ ...prev, [tab]: true }))
  }

  const handleTabChange = (nextTab: ApplicationTab) => {
    markTabTouched(activeTab)
    if (nextTab === activeTab) return

    if (!tabValidation[activeTab]) {
      setStepNavigationWarning(
        `Fix invalid fields in ${TAB_LABELS[activeTab]} before moving to another step.`,
      )
    } else {
      clearStepNavigationWarning()
    }

    setTouchedTabs((prev) => ({ ...prev, [nextTab]: true }))
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
    if (isLastTab) return
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
    if (isFirstTab) return
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
      contactInformation: data.contactInformation,
      education: data.education,
      motivation: data.motivation,
      agreements: data.agreements,
    })

    if (!fullValidation.success) {
      const firstInvalidTab = (tabs.map((tab) => tab.value) as ApplicationTab[]).find(
        (tab) => !tabValidation[tab],
      )
      if (firstInvalidTab) setActiveTab(firstInvalidTab)
      setSubmissionError('Please fill all required fields correctly before submitting.')
      return
    }

    try {
      const payload = prepareSubmitApplicationPayload(data)
      const response = await submitMutation.mutateAsync(payload)

      const id = response.applicant_id ? Number(response.applicant_id) : null
      if (!id || !Number.isFinite(id)) {
        throw new Error('The server did not return a valid applicant ID.')
      }

      setApplicantId(id)
      persistApplicantId(id)
      setViewMode('testIntro')
      setChatHistory([])
      setChatError(null)
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'Failed to send application. Please try again.',
      )
    }
  }

  const handleStartInternalTest = async () => {
    if (chatMutation.isPending || !applicantId) {
      if (!applicantId) setChatError('Unable to start internal test: applicant ID is missing.')
      return
    }

    setViewMode('testChat')
    setChatError(null)

    // Check for persisted chat history
    const persisted = getPersistedChatHistory(applicantId)
    if (persisted.length > 0) {
      setChatHistory(persisted)
      return
    }

    // Start fresh — send prompt to tell backend to begin the interview
    setChatHistory([])

    try {
      const response = await chatMutation.mutateAsync({
        text: 'The student is ready. Please start the interview with questions.',
        applicant_external_id: applicantId,
      })

      if (response.status === 'ready') {
        setViewMode('testFinished')
        return
      }

      const messages = agentResponseToMessages(response)
      setChatHistory(messages)
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : 'Failed to start the internal test. Please try again.',
      )
    }
  }

  const handleSendChatMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim()
      if (!trimmedText || chatMutation.isPending || !applicantId) return

      const userMessage: ChatMessage = { sender: 'user', text: trimmedText }
      setChatHistory((prev) => [...prev, userMessage])
      setChatError(null)

      try {
        const response = await chatMutation.mutateAsync({
          text: trimmedText,
          applicant_external_id: applicantId,
        })

        if (response.status === 'ready') {
          // Interview complete — show final message if any, then finish
          const finalMessages = agentResponseToMessages(response)
          if (finalMessages.length > 0) {
            setChatHistory((prev) => [...prev, ...finalMessages])
          }
          setViewMode('testFinished')
          return
        }

        const messages = agentResponseToMessages(response)
        setChatHistory((prev) => [...prev, ...messages])
      } catch (error) {
        setChatError(
          error instanceof Error
            ? error.message
            : 'Failed to send your answer. Please try again.',
        )
      }
    },
    [applicantId, chatMutation],
  )

  return {
    viewMode,
    chatHistory,
    chatError,
    touchedTabs,
    tabValidation,
    tabErrors,
    activeTabErrors: tabErrors[activeTab],
    stepNavigationWarning,
    submissionError,
    isSubmitting: submitMutation.isPending,
    isChatSubmitting: chatMutation.isPending,
    isFirstTab,
    isLastTab,
    handleTabChange,
    handleNextStep,
    handleBackStep,
    handleSubmitApplication,
    handleStartInternalTest,
    handleSendChatMessage,
  }
}
