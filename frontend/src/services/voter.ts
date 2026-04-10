// ===========================================
// VOTER SERVICE
// Location: src/services/voter.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import type { 
  VoterProfile, 
  VoterRegistrationData, 
  RegistrationStatus,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface NiifLookupResult {
  found: boolean;
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'M' | 'F';
  dateOfBirth?: string;
  county?: string;
  constituency?: string;
  ward?: string;
}

export interface RegistrationStatusResponse {
  status: RegistrationStatus;
  message?: string;
  registeredAt?: string;
  verifiedAt?: string;
}

export interface VoterFilterParams {
  county?: string;
  constituency?: string;
  ward?: string;
  status?: RegistrationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ===========================================
// VOTER SERVICE FUNCTIONS
// ===========================================

/**
 * Check if a national ID is already registered
 */
export async function checkIdAvailability(nationalId: string): Promise<boolean> {
  try {
    const response = await api.get<{ available: boolean }>(
      `/voters/check-id/${nationalId}`
    );
    
    return response?.available ?? false;
  } catch (error) {
    if (error instanceof ApiException) {
      // If error, assume not available
      if (error.status === 404) {
        return true;
      }
      throw new Error(error.message || 'Failed to check ID availability');
    }
    throw error;
  }
}

/**
 * Fetch voter data from NIIF (National Integrated Identity Management)
 * NOTE: Placeholder - no backend endpoint exists yet for NIIF lookup
 */
export async function lookupNiif(nationalId: string): Promise<NiifLookupResult> {
  try {
    const response = await api.get<NiifLookupResult>(
      `/voters/lookup-niif/${nationalId}`
    );

    if (response) {
      return response;
    }

    return { found: false };
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        return { found: false };
      }
      throw new Error(error.message || 'Failed to lookup voter in NIIF');
    }
    throw error;
  }
}

/**
 * Submit voter registration
 */
export async function register(voterData: VoterRegistrationData): Promise<VoterProfile> {
  try {
    const response = await api.post<VoterProfile>(
      '/voters/register',
      voterData
    );
    
    if (response) {
      return response;
    }
    
    throw new Error('Failed to register voter');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Registration failed');
    }
    throw error;
  }
}

/**
 * Get voter profile
 */
export async function getProfile(): Promise<VoterProfile> {
  try {
    const response = await api.get<VoterProfile>('/voters/profile');
    
    if (response) {
      return response;
    }
    
    throw new Error('Failed to get voter profile');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get profile');
    }
    throw error;
  }
}

/**
 * Get voter registration status
 * NOTE: Derives status from /voters/profile since /voters/registration-status doesn't exist
 */
export async function getRegistrationStatus(): Promise<RegistrationStatusResponse> {
  try {
    const profile = await api.get<VoterProfile>('/voters/profile');

    return {
      status: profile.registrationStatus || profile.status || 'not_registered',
      message: profile.registrationMessage,
      registeredAt: profile.registeredAt,
      verifiedAt: profile.verifiedAt,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      // If not found, user is not registered
      if (error.status === 404) {
        return { status: 'not_registered' };
      }
      throw new Error(error.message || 'Failed to get registration status');
    }
    throw error;
  }
}

/**
 * Update voter profile
 */
export async function updateProfile(data: Partial<VoterProfile>): Promise<VoterProfile> {
  try {
    const response = await api.patch<VoterProfile>(
      '/voters/profile',
      data
    );
    
    if (response) {
      return response;
    }
    
    throw new Error('Failed to update profile');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update profile');
    }
    throw error;
  }
}

/**
 * Submit biometric enrollment
 */
export async function enrollBiometrics(
  faceTemplate: string,
  fingerprints: Array<{ finger: string; template: string; quality: number }>
): Promise<void> {
  try {
    await api.post('/voters/biometrics', {
      faceTemplate,
      fingerprints,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to enroll biometrics');
    }
    throw error;
  }
}

/**
 * Verify biometric enrollment status
 */
export async function getBiometricStatus(): Promise<{
  face: boolean;
  fingerprints: boolean;
}> {
  try {
    const response = await api.get<ApiResponse<{
      face: boolean;
      fingerprints: boolean;
    }>>('/voters/biometrics/status');
    
    return response.data || { face: false, fingerprints: false };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get biometric status');
    }
    throw error;
  }
}

/**
 * Get all voters (admin/RO only)
 */
export async function getVoters(
  params: VoterFilterParams = {}
): Promise<PaginatedResponse<VoterProfile>> {
  try {
    const response = await api.get<PaginatedResponse<VoterProfile>>(
      '/voters',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    if (response) {
      return response;
    }
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voters');
    }
    throw error;
  }
}

/**
 * Get voter by ID (admin/RO only)
 */
export async function getVoterById(id: string): Promise<VoterProfile> {
  try {
    const response = await api.get<VoterProfile>(`/voters/${id}`);
    
    if (response) {
      return response;
    }
    
    throw new Error('Voter not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voter');
    }
    throw error;
  }
}

/**
 * Verify voter registration (admin/RO only)
 */
export async function verifyVoter(id: string): Promise<void> {
  try {
    await api.post(`/voters/${id}/verify`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to verify voter');
    }
    throw error;
  }
}

/**
 * Reject voter registration (admin/RO only)
 */
export async function rejectVoter(id: string, reason: string): Promise<void> {
  try {
    await api.post(`/voters/${id}/reject`, { reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject voter');
    }
    throw error;
  }
}

/**
 * Get voter statistics (admin/RO only)
 */
export async function getVoterStats(county?: string): Promise<{
  total: number;
  registered: number;
  verified: number;
  pending: number;
  byCounty: Array<{ county: string; count: number }>;
}> {
  try {
    const response = await api.get<{
      total: number;
      registered: number;
      verified: number;
      pending: number;
      byCounty: Array<{ county: string; count: number }>;
    }>('/voters/stats', { 
      params: county ? { county } : undefined 
    });
    
    return response || {
      total: 0,
      registered: 0,
      verified: 0,
      pending: 0,
      byCounty: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voter stats');
    }
    throw error;
  }
}

export default {
  checkIdAvailability,
  lookupNiif,
  register,
  getProfile,
  getRegistrationStatus,
  updateProfile,
  enrollBiometrics,
  getBiometricStatus,
  getVoters,
  getVoterById,
  verifyVoter,
  rejectVoter,
  getVoterStats,
};
