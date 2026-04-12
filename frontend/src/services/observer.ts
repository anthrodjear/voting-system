// ===========================================
// OBSERVER SERVICE
// Location: src/services/observer.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';

// ===========================================
// TYPES
// ===========================================

export interface ElectionStats {
  totalRegistered: number;
  totalVotes: number;
  turnoutPercentage: number;
  electionStatus: string;
}

export interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

export interface VoterTurnout {
  county: string;
  registered: number;
  voted: number;
  percentage: number;
}

export interface VoteVerification {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  verified: boolean;
  voteHash: string;
}

export interface ReportData {
  type: string;
  format: string;
  url?: string;
  data?: unknown;
  message?: string;
}

// ===========================================
// ELECTION STATS
// ===========================================

export async function getElectionStats(): Promise<ElectionStats> {
  try {
    const data = await api.get<ElectionStats>('/api/observer/election-stats', { skipAuth: true });
    return data || {
      totalRegistered: 0,
      totalVotes: 0,
      turnoutPercentage: 0,
      electionStatus: 'unknown'
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get election stats');
    }
    throw error;
  }
}

// ===========================================
// CANDIDATE RESULTS
// ===========================================

export async function getCandidateResults(): Promise<CandidateResult[]> {
  try {
    const data = await api.get<CandidateResult[]>('/api/observer/candidates', { skipAuth: true });
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get candidate results');
    }
    throw error;
  }
}

// ===========================================
// VOTER TURNOUT
// ===========================================

export async function getVoterTurnout(): Promise<VoterTurnout[]> {
  try {
    const data = await api.get<VoterTurnout[]>('/api/observer/voter-turnout', { skipAuth: true });
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voter turnout');
    }
    throw error;
  }
}

// ===========================================
// VOTE VERIFICATION
// ===========================================

export async function verifyVote(transactionHash: string): Promise<VoteVerification> {
  try {
    const data = await api.get<VoteVerification>(`/api/observer/vote/${transactionHash}`, { skipAuth: true });
    return data || {
      valid: false,
      transactionHash: '',
      timestamp: '',
      message: 'Verification failed'
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to verify vote');
    }
    throw error;
  }
}

// ===========================================
// REPORTS
// ===========================================

export async function generateReport(type: string, format: string): Promise<ReportData> {
  try {
    const data = await api.get<ReportData>('/api/observer/reports', {
      params: { type, format },
      skipAuth: true
    });
    return data || {
      type,
      format,
      message: 'Report generation failed'
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to generate report');
    }
    throw error;
  }
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  getElectionStats,
  getCandidateResults,
  getVoterTurnout,
  verifyVote,
  generateReport,
};