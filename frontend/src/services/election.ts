// ===========================================
// ELECTION SERVICE
// Location: src/services/election.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import type { 
  Election, 
  ElectionStatus, 
  Candidate,
  Position,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface ElectionFilterParams {
  status?: ElectionStatus;
  type?: 'general' | 'by-election' | 'primary';
  county?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ElectionWithResults extends Election {
  results?: {
    totalVotes: number;
    turnout: number;
    byPosition: Array<{
      positionId: string;
      positionTitle: string;
      candidates: Array<{
        candidateId: string;
        candidateName: string;
        party: string;
        votes: number;
        percentage: number;
      }>;
    }>;
  };
}

// ===========================================
// ELECTION SERVICE FUNCTIONS
// ===========================================

/**
 * Get all elections with optional filtering
 */
export async function getElections(
  params: ElectionFilterParams = {}
): Promise<PaginatedResponse<Election>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Election>>>(
      '/elections',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    if (response.data) {
      return response.data;
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
      throw new Error(error.message || 'Failed to get elections');
    }
    throw error;
  }
}

/**
 * Get active/upcoming election
 */
export async function getCurrentElection(): Promise<Election | null> {
  try {
    const response = await api.get<ApiResponse<Election>>('/elections/current');
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    if (error instanceof ApiException) {
      // No current election is not an error
      if (error.status === 404) {
        return null;
      }
      throw new Error(error.message || 'Failed to get current election');
    }
    throw error;
  }
}

/**
 * Get election by ID
 */
export async function getElectionById(id: string): Promise<Election> {
  try {
    const response = await api.get<ApiResponse<Election>>(`/elections/${id}`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Election not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get election');
    }
    throw error;
  }
}

/**
 * Get election by ID with results (if available)
 */
export async function getElectionWithResults(id: string): Promise<ElectionWithResults | null> {
  try {
    const response = await api.get<ApiResponse<ElectionWithResults>>(
      `/elections/${id}/results`
    );
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        return null;
      }
      throw new Error(error.message || 'Failed to get election results');
    }
    throw error;
  }
}

/**
 * Get election positions
 */
export async function getElectionPositions(electionId: string): Promise<Position[]> {
  try {
    const response = await api.get<ApiResponse<Position[]>>(
      `/elections/${electionId}/positions`
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get election positions');
    }
    throw error;
  }
}

/**
 * Get candidates for a specific position
 */
export async function getPositionCandidates(
  electionId: string,
  positionId: string
): Promise<Candidate[]> {
  try {
    const response = await api.get<ApiResponse<Candidate[]>>(
      `/elections/${electionId}/positions/${positionId}/candidates`
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get position candidates');
    }
    throw error;
  }
}

/**
 * Get candidate by ID
 */
export async function getCandidateById(id: string): Promise<Candidate> {
  try {
    const response = await api.get<ApiResponse<Candidate>>(`/candidates/${id}`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Candidate not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get candidate');
    }
    throw error;
  }
}

/**
 * Get all candidates with optional filtering (admin only)
 */
export async function getCandidates(
  params: {
    electionId?: string;
    status?: 'pending' | 'approved' | 'rejected';
    county?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedResponse<Candidate>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Candidate>>>(
      '/candidates',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    if (response.data) {
      return response.data;
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
      throw new Error(error.message || 'Failed to get candidates');
    }
    throw error;
  }
}

/**
 * Submit candidate application
 */
export async function submitCandidateApplication(data: {
  electionId: string;
  positionId: string;
  name: string;
  party: string;
  bio?: string;
  photo?: string;
}): Promise<Candidate> {
  try {
    const response = await api.post<ApiResponse<Candidate>>('/candidates', data);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to submit candidate application');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to submit candidate application');
    }
    throw error;
  }
}

/**
 * Approve candidate (admin only)
 */
export async function approveCandidate(id: string): Promise<void> {
  try {
    await api.post(`/candidates/${id}/approve`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to approve candidate');
    }
    throw error;
  }
}

/**
 * Reject candidate (admin only)
 */
export async function rejectCandidate(id: string, reason: string): Promise<void> {
  try {
    await api.post(`/candidates/${id}/reject`, { reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject candidate');
    }
    throw error;
  }
}

/**
 * Get election by type
 */
export async function getElectionsByType(
  type: 'general' | 'by-election' | 'primary'
): Promise<Election[]> {
  try {
    const response = await api.get<ApiResponse<Election[]>>(
      '/elections',
      { params: { type } as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get elections by type');
    }
    throw error;
  }
}

/**
 * Get upcoming elections
 */
export async function getUpcomingElections(): Promise<Election[]> {
  try {
    const response = await api.get<ApiResponse<Election[]>>('/elections/upcoming');
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get upcoming elections');
    }
    throw error;
  }
}

/**
 * Get election timeline
 */
export async function getElectionTimeline(electionId: string): Promise<{
  registration: { start: string; end: string };
  voting: { start: string; end: string };
  results: string;
}> {
  try {
    const response = await api.get<ApiResponse<{
      registration: { start: string; end: string };
      voting: { start: string; end: string };
      results: string;
    }>>(`/elections/${electionId}/timeline`);
    
    return response.data!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get election timeline');
    }
    throw error;
  }
}

export default {
  getElections,
  getCurrentElection,
  getElectionById,
  getElectionWithResults,
  getElectionPositions,
  getPositionCandidates,
  getCandidateById,
  getCandidates,
  submitCandidateApplication,
  approveCandidate,
  rejectCandidate,
  getElectionsByType,
  getUpcomingElections,
  getElectionTimeline,
};
