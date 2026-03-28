"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
} from "../types";
import { INITIAL_FORM_DATA } from "../constants";

interface ApplicationFormState {
  data: ApplicationFormData;
  activeTab: ApplicationTab;
  hasGuardian: boolean;

  /* Actions */
  setActiveTab: (tab: ApplicationTab) => void;
  setProgram: (program: SelectedProgram) => void;
  setPersonalInformation: (info: Partial<PersonalInformation>) => void;
  setFamilyDetails: (details: Partial<FamilyDetails>) => void;
  setContactInformation: (info: Partial<ContactInformation>) => void;
  setEducation: (edu: Partial<Education>) => void;
  setMotivation: (motivation: Partial<MotivationData>) => void;
  setAgreements: (agreements: Partial<Agreements>) => void;
  toggleGuardian: () => void;
  resetForm: () => void;
}

export const useApplicationFormStore = create<ApplicationFormState>()(
  persist(
    (set) => ({
      data: INITIAL_FORM_DATA,
      activeTab: "personal",
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

      setAgreements: (agreements) =>
        set((state) => ({
          data: {
            ...state.data,
            agreements: { ...state.data.agreements, ...agreements },
          },
        })),

      toggleGuardian: () =>
        set((state) => {
          const newHasGuardian = !state.hasGuardian;
          return {
            hasGuardian: newHasGuardian,
            data: {
              ...state.data,
              familyDetails: {
                ...state.data.familyDetails,
                guardian: newHasGuardian
                  ? {
                      firstName: "",
                      lastName: "",
                      patronymic: "",
                      phone: "",
                    }
                  : null,
              },
            },
          };
        }),

      resetForm: () =>
        set({
          data: INITIAL_FORM_DATA,
          activeTab: "personal",
          hasGuardian: false,
        }),
    }),
    {
      name: "invision-application-form",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: {
          ...state.data,
          // File cannot be serialized — skip it
          motivation: {
            ...state.data.motivation,
            motivationLetter: null,
          },
        },
        activeTab: state.activeTab,
        hasGuardian: state.hasGuardian,
      }),
    },
  ),
);
