// ===========================================
// VOTE SERVICE
// Location: src/services/vote.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import type { 
  Batch, 
  BatchStatus, 
  VoteSubmission, 
  VoteConfirmation,
  ApiResponse 
} from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface VoteData {
  electionId?: string;
  positionId?: string;
  candidateId?: string;
  encryptedVote: string;
  zkProof: string;
  batchId?: string;
}

export interface BatchStatusResponse {
  batch: Batch;
  votersAhead: number;
  estimatedWait: number;
}

export interface VoteReceipt {
  confirmationNumber: string;
  timestamp: string;
  electionId: string;
  positionId: string;
  candidateId: string;
  txHash: string;
}

export interface PendingVote {
  electionId: string;
  positionId: string;
  positionTitle: string;
  hasVoted: boolean;
}

// ===========================================
// VOTE SERVICE FUNCTIONS
// ===========================================

/**
 * Join a voting batch for an election
 */
export async function joinBatch(electionId: string): Promise<Batch> {
  try {
    const response = await api.post<ApiResponse<Batch>>(
      '/batches/join',
      { electionId }
    );
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to join voting batch');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to join voting batch');
    }
    throw error;
  }
}

/**
 * Get current batch status
 */
export async function getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
  try {
    const response = await api.get<ApiResponse<BatchStatusResponse>>(
      `/batches/${batchId}/status`
    );
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Batch not found');
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        throw new Error('Batch not found or expired');
      }
      throw new Error(error.message || 'Failed to get batch status');
    }
    throw error;
  }
}

/**
 * Leave a voting batch
 */
export async function leaveBatch(batchId: string): Promise<void> {
  try {
    await api.post(`/batches/${batchId}/leave`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to leave batch');
    }
    throw error;
  }
}

/**
 * Submit encrypted vote
 */
export async function submitVote(voteData: VoteData): Promise<VoteConfirmation> {
  try {
    const response = await api.post<ApiResponse<VoteConfirmation>>(
      '/votes/cast',
      voteData
    );
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to submit vote');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to submit vote');
    }
    throw error;
  }
}

/**
 * Get vote confirmation by confirmation ID
 */
export async function getConfirmation(confirmationId: string): Promise<VoteConfirmation> {
  try {
    const response = await api.get<ApiResponse<VoteConfirmation>>(
      `/votes/confirmation/${confirmationId}`
    );
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Confirmation not found');
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        throw new Error('Confirmation not found');
      }
      throw new Error(error.message || 'Failed to get confirmation');
    }
    throw error;
  }
}

/**
 * Get vote receipt
 * NOTE: Uses /votes/status endpoint since /votes/receipt doesn't exist
 */
export async function getVoteReceipt(electionId: string): Promise<VoteReceipt | null> {
  try {
    const response = await api.get<ApiResponse<VoteReceipt>>(
      `/votes/status/${electionId}`
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
      throw new Error(error.message || 'Failed to get vote receipt');
    }
    throw error;
  }
}

/**
 * Check if voter has already voted in an election
 */
export async function hasVoted(electionId: string): Promise<boolean> {
  try {
    const response = await api.get<ApiResponse<{ voted: boolean }>>(
      `/votes/status/${electionId}`
    );
    
    return response.data?.voted ?? false;
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        return false;
      }
      throw new Error(error.message || 'Failed to check vote status');
    }
    throw error;
  }
}

/**
 * Get pending votes for current user
 */
export async function getPendingVotes(): Promise<PendingVote[]> {
  try {
    const response = await api.get<ApiResponse<PendingVote[]>>('/votes/pending');
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get pending votes');
    }
    throw error;
  }
}

/**
 * Get voting progress for an election
 */
export async function getVotingProgress(
  electionId: string,
  params?: { county?: string; constituency?: string }
): Promise<{
  totalRegistered: number;
  totalVoted: number;
  turnout: number;
  byCounty: Array<{
    county: string;
    registered: number;
    voted: number;
    turnout: number;
  }>;
}> {
  try {
    const response = await api.get<ApiResponse<{
      totalRegistered: number;
      totalVoted: number;
      turnout: number;
      byCounty: Array<{
        county: string;
        registered: number;
        voted: number;
        turnout: number;
      }>;
    }>>(`/reports/turnout`, { params });
    
    return response.data || {
      totalRegistered: 0,
      totalVoted: 0,
      turnout: 0,
      byCounty: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voting progress');
    }
    throw error;
  }
}

/**
 * Verify vote on blockchain
 */
export async function verifyVoteOnChain(
  confirmationId: string
): Promise<{
  verified: boolean;
  blockNumber?: number;
  txHash?: string;
  timestamp?: string;
}> {
  try {
    const response = await api.get<ApiResponse<{
      verified: boolean;
      blockNumber?: number;
      txHash?: string;
      timestamp?: string;
    }>>(`/reports/blockchain/status`);
    
    return response.data || { verified: false };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to verify vote on chain');
    }
    throw error;
  }
}

/**
 * Get election results (real-time)
 */
export async function getLiveResults(electionId: string): Promise<{
  totalVotes: number;
  turnout: number;
  lastUpdated: string;
  byPosition: Array<{
    positionId: string;
    positionTitle: string;
    totalVotes: number;
    candidates: Array<{
      candidateId: string;
      candidateName: string;
      party: string;
      votes: number;
      percentage: number;
    }>;
  }>;
}> {
  try {
    const response = await api.get<ApiResponse<{
      totalVotes: number;
      turnout: number;
      lastUpdated: string;
      byPosition: Array<{
        positionId: string;
        positionTitle: string;
        totalVotes: number;
        candidates: Array<{
          candidateId: string;
          candidateName: string;
          party: string;
          votes: number;
          percentage: number;
        }>;
      }>;
    }>>(`/reports/results`);
    
    return response.data || {
      totalVotes: 0,
      turnout: 0,
      lastUpdated: '',
      byPosition: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get live results');
    }
    throw error;
  }
}

/**
 * Request ballot (initiate voting process)
 */
export async function requestBallot(electionId: string): Promise<{
  ballotId: string;
  expiresAt: string;
}> {
  try {
    const response = await api.get<ApiResponse<{
      ballotId: string;
      expiresAt: string;
    }>>(`/votes/ballot`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to request ballot');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to request ballot');
    }
    throw error;
  }
}

/**
 * Cancel ballot request
 */
export async function cancelBallotRequest(ballotId: string): Promise<void> {
  try {
    await api.post(`/votes/ballot/${ballotId}/cancel`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to cancel ballot request');
    }
    throw error;
  }
}

export default {
  joinBatch,
  getBatchStatus,
  leaveBatch,
  submitVote,
  getConfirmation,
  getVoteReceipt,
  hasVoted,
  getPendingVotes,
  getVotingProgress,
  verifyVoteOnChain,
  getLiveResults,
  requestBallot,
  cancelBallotRequest,
};
