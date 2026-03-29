'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { serializedLetterToFile } from '../types'
import type {
  ApplicationFormData,
  ApplicationTab,
  SelectedProgram,
  PersonalInformation,
  FamilyDetails,
  ContactInformation,
  Education,
  MotivationData,
  Agreements,
} from '../types'
import { INITIAL_FORM_DATA } from '../constants'

interface ApplicationFormState {
  data: ApplicationFormData
  activeTab: ApplicationTab
  hasGuardian: boolean

  /* Actions */
  setActiveTab: (tab: ApplicationTab) => void
  setProgram: (program: SelectedProgram) => void
  setPersonalInformation: (info: Partial<PersonalInformation>) => void
  setFamilyDetails: (details: Partial<FamilyDetails>) => void
  setContactInformation: (info: Partial<ContactInformation>) => void
  setEducation: (edu: Partial<Education>) => void
  setMotivation: (motivation: Partial<MotivationData>) => void
  getMotivationLetterFile: () => File | null
  setAgreements: (agreements: Partial<Agreements>) => void
  toggleGuardian: () => void
  resetForm: () => void
}

type PersistedApplicationFormState = Pick<
  ApplicationFormState,
  'data' | 'activeTab' | 'hasGuardian'
>

export const useApplicationFormStore = create<ApplicationFormState>()(
  persist<ApplicationFormState, [], [], PersistedApplicationFormState>(
    (set, get) => ({
      data: INITIAL_FORM_DATA,
      activeTab: 'personal',
      hasGuardian: false,

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

      setFamilyDetails: (details) =>
        set((state) => ({
          data: {
            ...state.data,
            familyDetails: {
              ...state.data.familyDetails,
              ...details,
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

      getMotivationLetterFile: (): File | null => {
        const storedLetter = get().data.motivation.motivationLetter
        if (!storedLetter) {
          return null
        }

        return serializedLetterToFile(storedLetter)
      },

      setAgreements: (agreements: Partial<Agreements>) =>
        set((state) => ({
          data: {
            ...state.data,
            agreements: { ...state.data.agreements, ...agreements },
          },
        })),

      toggleGuardian: () =>
        set((state) => {
          const newHasGuardian = !state.hasGuardian
          return {
            hasGuardian: newHasGuardian,
            data: {
              ...state.data,
              familyDetails: {
                ...state.data.familyDetails,
                guardian: newHasGuardian
                  ? {
                      firstName: '',
                      lastName: '',
                      patronymic: '',
                      phone: '',
                    }
                  : null,
              },
            },
          }
        }),

      resetForm: () =>
        set({
          data: INITIAL_FORM_DATA,
          activeTab: 'personal',
          hasGuardian: false,
        }),
    }),
    {
      name: 'invision-application-form',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        activeTab: state.activeTab,
        hasGuardian: state.hasGuardian,
      }),
    },
  ),
)
