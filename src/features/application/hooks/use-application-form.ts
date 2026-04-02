'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ApplicationFormData,
  ApplicationTab,
  SelectedProgram,
  PersonalInformation,
  ContactInformation,
  Education,
  MotivationData,
  Agreements,
} from '../types'
import { INITIAL_FORM_DATA } from '../constants'

interface ApplicationFormState {
  data: ApplicationFormData
  activeTab: ApplicationTab

  /* Actions */
  setActiveTab: (tab: ApplicationTab) => void
  setProgram: (program: SelectedProgram) => void
  setPersonalInformation: (info: Partial<PersonalInformation>) => void
  setContactInformation: (info: Partial<ContactInformation>) => void
  setEducation: (edu: Partial<Education>) => void
  setMotivation: (motivation: Partial<MotivationData>) => void
  setAgreements: (agreements: Partial<Agreements>) => void
  resetForm: () => void
}

type PersistedApplicationFormState = Pick<ApplicationFormState, 'data' | 'activeTab'>

const mergePersistedState = (
  persisted: unknown,
  current: ApplicationFormState,
): ApplicationFormState => {
  if (!persisted || typeof persisted !== 'object') {
    return current
  }

  const typedPersisted = persisted as Partial<PersistedApplicationFormState>
  const persistedData = typedPersisted.data

  const motivationLetter =
    persistedData?.motivation?.motivationLetter &&
    typeof persistedData.motivation.motivationLetter.fileUrl === 'string'
      ? persistedData.motivation.motivationLetter
      : null

  return {
    ...current,
    activeTab: typedPersisted.activeTab ?? current.activeTab,
    data: {
      ...INITIAL_FORM_DATA,
      ...persistedData,
      personalInformation: {
        ...INITIAL_FORM_DATA.personalInformation,
        ...persistedData?.personalInformation,
        citizenship: 'Kazakhstan',
      },
      contactInformation: {
        ...INITIAL_FORM_DATA.contactInformation,
        ...persistedData?.contactInformation,
        contacts: {
          ...INITIAL_FORM_DATA.contactInformation.contacts,
          ...persistedData?.contactInformation?.contacts,
        },
      },
      education: {
        ...INITIAL_FORM_DATA.education,
        ...persistedData?.education,
        englishProficiency: {
          ...INITIAL_FORM_DATA.education.englishProficiency,
          ...persistedData?.education?.englishProficiency,
        },
        schoolCertificate: {
          ...INITIAL_FORM_DATA.education.schoolCertificate,
          ...persistedData?.education?.schoolCertificate,
        },
      },
      motivation: {
        ...INITIAL_FORM_DATA.motivation,
        ...persistedData?.motivation,
        motivationLetter,
      },
      agreements: {
        ...INITIAL_FORM_DATA.agreements,
        ...persistedData?.agreements,
      },
    },
  }
}

export const useApplicationFormStore = create<ApplicationFormState>()(
  persist<ApplicationFormState, [], [], PersistedApplicationFormState>(
    (set) => ({
      data: INITIAL_FORM_DATA,
      activeTab: 'personal',

      setActiveTab: (tab) => set({ activeTab: tab }),

      setProgram: (program) =>
        set((state) => ({
          data: { ...state.data, program },
        })),

      setPersonalInformation: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInformation: {
              ...state.data.personalInformation,
              ...info,
            },
          },
        })),

      setContactInformation: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            contactInformation: {
              ...state.data.contactInformation,
              ...info,
            },
          },
        })),

      setEducation: (edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: { ...state.data.education, ...edu },
          },
        })),

      setMotivation: (motivation) =>
        set((state) => ({
          data: {
            ...state.data,
            motivation: { ...state.data.motivation, ...motivation },
          },
        })),

      setAgreements: (agreements: Partial<Agreements>) =>
        set((state) => ({
          data: {
            ...state.data,
            agreements: { ...state.data.agreements, ...agreements },
          },
        })),

      resetForm: () =>
        set({
          data: INITIAL_FORM_DATA,
          activeTab: 'personal',
        }),
    }),
    {
      name: 'invision-application-form',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        activeTab: state.activeTab,
      }),
      merge: (persistedState, currentState) => mergePersistedState(persistedState, currentState),
    },
  ),
)
