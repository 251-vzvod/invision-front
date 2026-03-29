'use client'

import { useMemo, useState } from 'react'
import {
  useInternalTestChatMutation,
  useSubmitApplicationMutation,
  prepareSubmitApplicationPayload,
} from '../api'
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
  ChatResponsePayload,
} from '../types'

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

const INTERNAL_TEST_GREETING: ChatMessage = {
  question_id: 0,
  sender: 'Agent',
  text: 'Congratulations. Your application has been submitted successfully. You now need to complete an internal test with our AI agent. The test usually includes around 15 questions to identify your strongest skills. Please answer carefully and provide thoughtful details.',
}

const normalizeAgentMessage = (message: ChatResponsePayload): ChatMessage => ({
  question_id: Number.isFinite(message.question_id) ? message.question_id : 0,
  sender: 'Agent',
  text: message.text?.trim() || 'Thank you. Please continue with the next answer.',
})

export function useApplicationFormFlow({
  data,
  activeTab,
  setActiveTab,
  tabs,
}: UseApplicationFormFlowParams) {
  const [viewMode, setViewMode] = useState<ApplicationViewMode>('form')
  const [internalTestUserId, setInternalTestUserId] = useState<string | null>(null)
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
  const chatMutation = useInternalTestChatMutation()

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

  const clearSubmissionStatus = () => {
    setSubmissionError(null)
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
      const response = await submitMutation.mutateAsync(payload)

      if (!response.user_id) {
        throw new Error('The server did not return user_id for internal test initialization.')
      }

      setInternalTestUserId(response.user_id)
      setViewMode('testIntro')
      setChatHistory([])
      setChatError(null)
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'Failed to send application. Please try again.',
      )
    }
  }

  const requestAgentMessage = async (history: ChatMessage[]) => {
    if (!internalTestUserId) {
      throw new Error('user_id is missing. Please submit the application again.')
    }

    const response = await chatMutation.mutateAsync({
      user_id: internalTestUserId,
      history,
    })

    return normalizeAgentMessage(response)
  }

  const handleStartInternalTest = async () => {
    if (chatMutation.isPending) {
      return
    }

    if (!internalTestUserId) {
      setChatError('Unable to start internal test: user_id is missing.')
      return
    }

    setViewMode('testChat')
    setChatError(null)
    setChatHistory([INTERNAL_TEST_GREETING])

    try {
      const firstAgentQuestion = await requestAgentMessage([INTERNAL_TEST_GREETING])
      setChatHistory((prev) => [...prev, firstAgentQuestion])

      if (firstAgentQuestion.question_id === 0) {
        setViewMode('testFinished')
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : 'Failed to start the internal test. Please try again.',
      )
    }
  }

  const handleSendChatMessage = async (text: string) => {
    const trimmedText = text.trim()
    if (!trimmedText || chatMutation.isPending) {
      return
    }

    if (!internalTestUserId) {
      setChatError('Unable to continue internal test: user_id is missing.')
      return
    }

    const latestQuestionId =
      [...chatHistory]
        .reverse()
        .find((message) => message.sender === 'Agent' && message.question_id > 0)?.question_id ?? 1

    const userMessage: ChatMessage = {
      question_id: latestQuestionId,
      sender: 'User',
      text: trimmedText,
    }

    const nextHistory = [...chatHistory, userMessage]
    setChatHistory(nextHistory)
    setChatError(null)

    try {
      const agentReply = await requestAgentMessage(nextHistory)
      setChatHistory((prev) => [...prev, agentReply])

      if (agentReply.question_id === 0) {
        setViewMode('testFinished')
      }
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : 'Failed to send your answer. Please try again.',
      )
    }
  }

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
