'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoterRegistrationStore } from '@/stores/voter-registration.store';
import { lookupNiif, register as registerVoter } from '@/services/voter';
import type { VoterRegistrationData } from '@/types';

interface NiifData {
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  county?: string;
  constituency?: string;
  ward?: string;
  placeOfBirth?: {
    county: string;
    constituency: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Hook for managing the voter registration flow
 */
export function useRegistration() {
  const router = useRouter();
  const {
    step,
    nationalId,
    niifData,
    personalInfo,
    biometrics,
    account,
    validationErrors,
    isSubmitting,
    setStep,
    setNationalId,
    setNiifData,
    setPersonalInfo,
    setBiometrics,
    setAccount,
    setValidationError,
    clearValidationError,
    setSubmitting,
    reset
  } = useVoterRegistrationStore();
  
  const [error, setError] = useState<string | null>(null);
  const [idVerificationStatus, setIdVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  
  // Maximum step is 5 (review & submit)
  const MAX_STEP = 5;
  
  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    if (step < MAX_STEP) {
      setStep(step + 1);
    }
  }, [step, setStep]);
  
  /**
   * Navigate to previous step
   */
  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step, setStep]);
  
  /**
   * Go to specific step
   */
  const goToStep = useCallback((newStep: number) => {
    if (newStep >= 1 && newStep <= MAX_STEP) {
      setStep(newStep);
    }
  }, [setStep]);
  
  /**
   * Validate current step
   */
  const validateStep = useCallback((validateStep: number): boolean => {
    const errors: ValidationErrors = {};
    
    switch (validateStep) {
      case 1: // National ID Verification
        if (!nationalId || nationalId.length < 7) {
          errors.nationalId = 'Please enter a valid National ID';
        }
        break;
        
      case 2: // Personal Information
        if (!personalInfo.firstName) errors.firstName = 'First name is required';
        if (!personalInfo.lastName) errors.lastName = 'Last name is required';
        if (!personalInfo.gender) errors.gender = 'Gender is required';
        if (!personalInfo.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (!personalInfo.county) errors.county = 'County is required';
        if (!personalInfo.constituency) errors.constituency = 'Constituency is required';
        if (!personalInfo.ward) errors.ward = 'Ward is required';
        break;
        
      case 3: // Biometrics
        if (!biometrics.faceCapture) errors.faceCapture = 'Face capture is required';
        if (biometrics.fingerprints.length === 0) {
          errors.fingerprints = 'At least one fingerprint is required';
        }
        if (!biometrics.livenessVerified) {
          errors.liveness = 'Liveness verification is required';
        }
        break;
        
      case 4: // Account Setup
        if (!account.password) errors.password = 'Password is required';
        if (account.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        if (!account.securityQuestions || account.securityQuestions.length < 2) {
          errors.securityQuestions = 'At least 2 security questions are required';
        }
        break;
        
      case 5: // Review & Submit
        // All data should be valid at this point
        break;
    }
    
    // Set or clear errors
    Object.entries(errors).forEach(([field, message]) => {
      setValidationError(field, message);
    });
    
    return Object.keys(errors).length === 0;
  }, [
    nationalId,
    personalInfo,
    biometrics,
    account,
    setValidationError
  ]);
  
  /**
   * Verify National ID using NIIF lookup
   */
  const verifyNationalId = useCallback(async (id: string) => {
    setIdVerificationStatus('verifying');
    setError(null);
    
    try {
      const data = await lookupNiif(id);
      if (data.found) {
        const niifData: NiifData = {
          nationalId: data.nationalId || id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          gender: data.gender || 'M',
          dateOfBirth: data.dateOfBirth || '',
          county: data.county,
          constituency: data.constituency,
          ward: data.ward,
          placeOfBirth: data.county && data.constituency ? {
            county: data.county,
            constituency: data.constituency
          } : undefined
        };
        setNiifData(niifData);
        setNationalId(id);
        setIdVerificationStatus('success');
        return data;
      } else {
        setIdVerificationStatus('error');
        setError('National ID not found in NIIF database');
        throw new Error('National ID not found');
      }
    } catch (err) {
      setIdVerificationStatus('error');
      const message = err instanceof Error ? err.message : 'ID verification failed';
      setError(message);
      throw err;
    }
  }, [setNiifData, setNationalId]);
  
  /**
   * Submit registration
   */
  const submitRegistration = useCallback(async () => {
    if (!validateStep(step)) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const registrationData: VoterRegistrationData = {
        nationalId,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth,
        county: personalInfo.county,
        constituency: personalInfo.constituency,
        ward: personalInfo.ward,
        email: personalInfo.email,
        phone: personalInfo.phone,
        faceTemplate: biometrics.faceCapture || '',
        fingerprints: biometrics.fingerprints,
        password: account.password,
        securityQuestions: account.securityQuestions
      };
      
      await registerVoter(registrationData);
      
      // Reset form and redirect to success
      reset();
      router.push('/voter/registration-success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [
    step,
    validateStep,
    nationalId,
    personalInfo,
    biometrics,
    account,
    setSubmitting,
    reset,
    router
  ]);
  
  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError(null);
    Object.keys(validationErrors).forEach(field => {
      clearValidationError(field);
    });
  }, [validationErrors, clearValidationError]);
  
  /**
   * Reset registration
   */
  const resetRegistration = useCallback(() => {
    reset();
    setError(null);
    setIdVerificationStatus('idle');
  }, [reset]);
  
  /**
   * Get step title
   */
  const getStepTitle = useCallback((stepNumber: number): string => {
    const titles: Record<number, string> = {
      1: 'Verify Your Identity',
      2: 'Personal Information',
      3: 'Biometric Verification',
      4: 'Create Account',
      5: 'Review & Submit'
    };
    return titles[stepNumber] || '';
  }, []);
  
  /**
   * Get step description
   */
  const getStepDescription = useCallback((stepNumber: number): string => {
    const descriptions: Record<number, string> = {
      1: 'Enter your National ID to verify your identity',
      2: 'Confirm your personal details from the NIIF database',
      3: 'Complete face and fingerprint verification',
      4: 'Set up your secure account credentials',
      5: 'Review your information and submit your application'
    };
    return descriptions[stepNumber] || '';
  }, []);
  
  /**
   * Check if can proceed to next step
   */
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return idVerificationStatus === 'success';
      case 2:
        return !!(
          personalInfo.firstName &&
          personalInfo.lastName &&
          personalInfo.gender &&
          personalInfo.dateOfBirth &&
          personalInfo.county &&
          personalInfo.constituency &&
          personalInfo.ward
        );
      case 3:
        return !!(
          biometrics.faceCapture &&
          biometrics.fingerprints.length > 0 &&
          biometrics.livenessVerified
        );
      case 4:
        return !!(
          account.password &&
          account.password.length >= 8 &&
          account.securityQuestions.length >= 2
        );
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, idVerificationStatus, personalInfo, biometrics, account]);
  
  /**
   * Get progress percentage
   */
  const progressPercentage = ((step - 1) / (MAX_STEP - 1)) * 100;
  
  return {
    // State
    step,
    maxStep: MAX_STEP,
    nationalId,
    niifData,
    personalInfo,
    biometrics,
    account,
    validationErrors,
    isSubmitting,
    error,
    idVerificationStatus,
    progressPercentage,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Actions
    validateStep,
    verifyNationalId,
    submitRegistration,
    clearErrors,
    resetRegistration,
    
    // Setters
    setNationalId,
    setNiifData,
    setPersonalInfo,
    setBiometrics,
    setAccount,
    setValidationError,
    clearValidationError,
    
    // Helpers
    getStepTitle,
    getStepDescription,
    canProceed
  };
}

export default useRegistration;
