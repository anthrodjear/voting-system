// ===========================================
// RETURNING OFFICER SERVICE
// Location: src/services/ro.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import type { 
  ApiResponse,
  VoterProfile,
  Batch,
  Election 
} from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface RODashboardStats {
  county: string;
  voters: {
    total: number;
    registered: number;
    verified: number;
    pending: number;
  };
  votes: {
    total: number;
    turnout: number;
    lastHour: number;
  };
  batches: {
    active: number;
    waiting: number;
    completed: number;
  };
}

export interface PendingApproval {
  id: string;
  type: 'voter' | 'candidate' | 'batch';
  title: string;
  description: string;
  submittedAt: string;
  submittedBy: string;
}

export interface VotingProgress {
  electionId: string;
  electionName: string;
  totalRegistered: number;
  totalVoted: number;
  turnout: number;
  byConstituency: Array<{
    constituency: string;
    registered: number;
    voted: number;
    turnout: number;
  }>;
  byWard: Array<{
    ward: string;
    constituency: string;
    registered: number;
    voted: number;
    turnout: number;
  }>;
}

export interface CountyVoter {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  registrationStatus: 'pending' | 'verified' | 'rejected';
  ward: string;
  constituency: string;
  registeredAt?: string;
  verifiedAt?: string;
}

export interface VoterManagementFilter {
  status?: 'pending' | 'verified' | 'rejected';
  constituency?: string;
  ward?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ===========================================
// RO SERVICE FUNCTIONS
// ===========================================

/**
 * Get returning officer dashboard statistics
 */
export async function getDashboardStats(): Promise<RODashboardStats> {
  try {
    const response = await api.get<ApiResponse<RODashboardStats>>('/ro/dashboard/stats');
    
    if (response.data) {
      return response.data;
    }
    
    // Return default stats
    return {
      county: '',
      voters: { total: 0, registered: 0, verified: 0, pending: 0 },
      votes: { total: 0, turnout: 0, lastHour: 0 },
      batches: { active: 0, waiting: 0, completed: 0 },
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get dashboard stats');
    }
    throw error;
  }
}

/**
 * Get pending approvals for the returning officer's county
 */
export async function getPendingApprovals(
  params?: { type?: string; page?: number; pageSize?: number }
): Promise<PendingApproval[]> {
  try {
    const response = await api.get<ApiResponse<PendingApproval[]>>(
      '/ro/pending-approvals',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get pending approvals');
    }
    throw error;
  }
}

/**
 * Get real-time voting progress
 */
export async function getVotingProgress(electionId?: string): Promise<VotingProgress[]> {
  try {
    const response = await api.get<ApiResponse<VotingProgress[]>>(
      '/ro/voting-progress',
      { params: electionId ? { electionId } : undefined }
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voting progress');
    }
    throw error;
  }
}

/**
 * Get voters in the returning officer's county
 */
export async function getCountyVoters(
  params: VoterManagementFilter = {}
): Promise<{
  data: CountyVoter[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    const response = await api.get<ApiResponse<{
      data: CountyVoter[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>('/ro/voters', { 
      params: params as Record<string, string | number | boolean | undefined> 
    });
    
    return response.data || {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get county voters');
    }
    throw error;
  }
}

/**
 * Verify a voter in the returning officer's county
 */
export async function verifyVoter(voterId: string): Promise<void> {
  try {
    await api.post(`/ro/voters/${voterId}/verify`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to verify voter');
    }
    throw error;
  }
}

/**
 * Reject a voter in the returning officer's county
 */
export async function rejectVoter(voterId: string, reason: string): Promise<void> {
  try {
    await api.post(`/ro/voters/${voterId}/reject`, { reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject voter');
    }
    throw error;
  }
}

/**
 * Get active batches in the returning officer's county
 */
export async function getActiveBatches(
  params?: { status?: string; limit?: number }
): Promise<Batch[]> {
  try {
    const response = await api.get<ApiResponse<Batch[]>>(
      '/ro/batches/active',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get active batches');
    }
    throw error;
  }
}

/**
 * Get batch by ID
 */
export async function getBatchById(batchId: string): Promise<Batch> {
  try {
    const response = await api.get<ApiResponse<Batch>>(`/ro/batches/${batchId}`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Batch not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get batch');
    }
    throw error;
  }
}

/**
 * Close a batch
 */
export async function closeBatch(batchId: string): Promise<void> {
  try {
    await api.post(`/ro/batches/${batchId}/close`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to close batch');
    }
    throw error;
  }
}

/**
 * Get elections for the returning officer's county
 */
export async function getCountyElections(): Promise<Election[]> {
  try {
    const response = await api.get<ApiResponse<Election[]>>('/ro/elections');
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get county elections');
    }
    throw error;
  }
}

/**
 * Get voter statistics for the returning officer's county
 */
export async function getVoterStatistics(): Promise<{
  total: number;
  registered: number;
  verified: number;
  pending: number;
  rejected: number;
  byConstituency: Array<{
    constituency: string;
    total: number;
    registered: number;
    verified: number;
  }>;
}> {
  try {
    const response = await api.get<ApiResponse<{
      total: number;
      registered: number;
      verified: number;
      pending: number;
      rejected: number;
      byConstituency: Array<{
        constituency: string;
        total: number;
        registered: number;
        verified: number;
      }>;
    }>>('/ro/voters/statistics');
    
    return response.data || {
      total: 0,
      registered: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      byConstituency: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voter statistics');
    }
    throw error;
  }
}

/**
 * Get voting statistics for the returning officer's county
 */
export async function getVotingStatistics(electionId?: string): Promise<{
  totalRegistered: number;
  totalVoted: number;
  turnout: number;
  lastHour: number;
  byHour: Array<{ hour: string; votes: number }>;
}> {
  try {
    const response = await api.get<ApiResponse<{
      totalRegistered: number;
      totalVoted: number;
      turnout: number;
      lastHour: number;
      byHour: Array<{ hour: string; votes: number }>;
    }>>('/ro/voting/statistics', { 
      params: electionId ? { electionId } : undefined 
    });
    
    return response.data || {
      totalRegistered: 0,
      totalVoted: 0,
      turnout: 0,
      lastHour: 0,
      byHour: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voting statistics');
    }
    throw error;
  }
}

/**
 * Get recent activity in the returning officer's county
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<Array<{
  id: string;
  type: string;
  action: string;
  details: string;
  timestamp: string;
  user?: string;
}>> {
  try {
    const response = await api.get<ApiResponse<Array<{
      id: string;
      type: string;
      action: string;
      details: string;
      timestamp: string;
      user?: string;
    }>>>('/ro/activity', { params: { limit } });
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get recent activity');
    }
    throw error;
  }
}

/**
 * Export voter list
 */
export async function exportVoters(
  format: 'csv' | 'excel' | 'pdf',
  filters?: VoterManagementFilter
): Promise<Blob> {
  try {
    const response = await api.get<Blob>(
      '/ro/voters/export',
      { 
        params: { format, ...filters } as Record<string, string | number | boolean | undefined>,
        skipAuth: false,
      }
    );
    
    return response;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to export voters');
    }
    throw error;
  }
}

export default {
  getDashboardStats,
  getPendingApprovals,
  getVotingProgress,
  getCountyVoters,
  verifyVoter,
  rejectVoter,
  getActiveBatches,
  getBatchById,
  closeBatch,
  getCountyElections,
  getVoterStatistics,
  getVotingStatistics,
  getRecentActivity,
  exportVoters,
};
