// ===========================================
// VOTING STORE
// Location: src/stores/voting.store.ts
// ===========================================

import { create } from 'zustand';

export type BatchStatus = 'waiting' | 'active' | 'submitting' | 'completed' | 'expired';

export interface VotingState {
  // Batch management
  batchId: string | null;
  batchStatus: BatchStatus;
  positionInBatch: number;
  totalInBatch: number;
  timeRemaining: number;
  
  // Ballot
  positions: Position[];
  selections: Record<string, string>;
  
  // Submission
  isSubmitting: boolean;
  submissionProgress: SubmissionProgress | null;
  confirmation: VoteConfirmation | null;
  
  // UI State
  error: VotingError | null;
  
  // Actions
  setBatchInfo: (info: Partial<VotingState>) => void;
  setPositions: (positions: Position[]) => void;
  selectCandidate: (positionId: string, candidateId: string) => void;
  clearSelection: (positionId: string) => void;
  clearAllSelections: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmissionProgress: (progress: SubmissionProgress | null) => void;
  setConfirmation: (confirmation: VoteConfirmation | null) => void;
  setError: (error: VotingError | null) => void;
  reset: () => void;
}

interface Position {
  id: string;
  title: string;
  description?: string;
  level: 'national' | 'county' | 'constituency' | 'ward';
  maxCandidates: number;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo?: string;
  symbol?: string;
}

interface SubmissionProgress {
  stage: 'encrypting' | 'submitting' | 'confirming' | 'complete';
  message: string;
}

interface VoteConfirmation {
  confirmationNumber: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

interface VotingError {
  code: string;
  title: string;
  message: string;
}

const initialState = {
  batchId: null,
  batchStatus: 'waiting' as BatchStatus,
  positionInBatch: 0,
  totalInBatch: 0,
  timeRemaining: 0,
  positions: [],
  selections: {},
  isSubmitting: false,
  submissionProgress: null,
  confirmation: null,
  error: null,
};

export const useVotingStore = create<VotingState>()((set) => ({
  ...initialState,

  setBatchInfo: (info) => set(info),
  
  setPositions: (positions) => set({ positions }),
  
  selectCandidate: (positionId, candidateId) =>
    set((state) => ({
      selections: { ...state.selections, [positionId]: candidateId },
    })),
  
  clearSelection: (positionId) =>
    set((state) => {
      const { [positionId]: _, ...rest } = state.selections;
      return { selections: rest };
    }),
  
  clearAllSelections: () => set({ selections: {} }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  setSubmissionProgress: (submissionProgress) => set({ submissionProgress }),
  
  setConfirmation: (confirmation) => set({ confirmation }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));
