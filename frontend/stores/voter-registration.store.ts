// ===========================================
// VOTER REGISTRATION STORE
// Location: src/stores/voter-registration.store.ts
// ===========================================

import { create } from 'zustand';

export interface VoterRegistrationState {
  // Registration step (1-5)
  step: number;
  
  // Step 1: ID Verification
  nationalId: string;
  
  // Step 2: Personal Info (from NIIF)
  niifData: NIIFResponse | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: 'M' | 'F';
    dateOfBirth: string;
    county: string;
    constituency: string;
    ward: string;
    email?: string;
    phone?: string;
  };
  
  // Step 3: Biometrics
  biometrics: {
    faceCapture: string | null;
    fingerprints: FingerprintData[];
    livenessVerified: boolean;
  };
  
  // Step 4: Account
  account: {
    password: string;
    securityQuestions: SecurityAnswer[];
  };
  
  // UI State
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setNationalId: (id: string) => void;
  setNiifData: (data: NIIFResponse | null) => void;
  setPersonalInfo: (info: Partial<VoterRegistrationState['personalInfo']>) => void;
  setBiometrics: (biometrics: Partial<VoterRegistrationState['biometrics']>) => void;
  setAccount: (account: Partial<VoterRegistrationState['account']>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

interface NIIFResponse {
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  placeOfBirth?: {
    county: string;
    constituency: string;
  };
}

interface FingerprintData {
  finger: string;
  template: string;
  quality: number;
}

interface SecurityAnswer {
  questionId: string;
  answer: string;
}

const initialState = {
  step: 1,
  nationalId: '',
  niifData: null,
  personalInfo: {
    firstName: '',
    lastName: '',
    gender: 'M' as const,
    dateOfBirth: '',
    county: '',
    constituency: '',
    ward: '',
  },
  biometrics: {
    faceCapture: null,
    fingerprints: [],
    livenessVerified: false,
  },
  account: {
    password: '',
    securityQuestions: [],
  },
  validationErrors: {},
  isSubmitting: false,
};

export const useVoterRegistrationStore = create<VoterRegistrationState>()((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  
  setNationalId: (nationalId) => set({ nationalId }),
  
  setNiifData: (niifData) => set({ niifData }),
  
  setPersonalInfo: (info) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...info },
    })),
  
  setBiometrics: (biometrics) =>
    set((state) => ({
      biometrics: { ...state.biometrics, ...biometrics },
    })),
  
  setAccount: (account) =>
    set((state) => ({
      account: { ...state.account, ...account },
    })),
  
  setValidationError: (field, error) =>
    set((state) => ({
      validationErrors: { ...state.validationErrors, [field]: error },
    })),
  
  clearValidationError: (field) =>
    set((state) => {
      const { [field]: _, ...rest } = state.validationErrors;
      return { validationErrors: rest };
    }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  reset: () => set(initialState),
}));
