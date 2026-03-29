'use client';

import { useCallback, useEffect, useState } from 'react';
import { useVotingStore, type BatchStatus } from '@/stores/voting.store';
import { joinBatch as voteJoinBatch, leaveBatch as voteLeaveBatch, submitVote as voteSubmitVote } from '@/services/vote';
import { getElectionPositions } from '@/services/election';
import type { Batch, VoteConfirmation, Position } from '@/types';

// JoinBatchParams is no longer needed as joinBatch only takes electionId

/**
 * Hook for managing the voting process
 */
export function useVoting() {
  const {
    batchId,
    batchStatus,
    positionInBatch,
    totalInBatch,
    timeRemaining,
    positions,
    selections,
    isSubmitting,
    submissionProgress,
    confirmation,
    error,
    setBatchInfo,
    setPositions,
    selectCandidate,
    clearSelection,
    clearAllSelections,
    setSubmitting,
    setSubmissionProgress,
    setConfirmation,
    setError,
    reset
  } = useVotingStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate if user is in a batch
  const isInBatch = !!batchId && batchStatus !== 'completed';
  
  // Calculate if user can vote
  const canVote = isInBatch && batchStatus === 'active' && timeRemaining > 0;
  
  /**
   * Join a voting batch
   */
  const joinBatch = useCallback(async (electionId: string): Promise<Batch> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const batch = await voteJoinBatch(electionId);
      
      setBatchInfo({
        batchId: batch.id,
        batchStatus: batch.status,
        positionInBatch: batch.position,
        totalInBatch: batch.totalVoters,
        timeRemaining: calculateTimeRemaining(batch)
      });
      
      return batch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join voting queue';
      setError({
        code: 'JOIN_BATCH_ERROR',
        title: 'Unable to Join Queue',
        message
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setBatchInfo, setError]);
  
  /**
   * Leave current batch
   */
  const leaveBatch = useCallback(async () => {
    if (!batchId) return;
    
    setIsLoading(true);
    
    try {
      await voteLeaveBatch(batchId);
    } catch {
      // Ignore errors when leaving batch
    } finally {
      reset();
      setIsLoading(false);
    }
  }, [batchId, reset]);
  
  /**
   * Load election positions and candidates
   */
  const loadBallot = useCallback(async (electionId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const positions = await getElectionPositions(electionId);
      setPositions(positions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load ballot';
      setError({
        code: 'LOAD_BALLOT_ERROR',
        title: 'Unable to Load Ballot',
        message
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setPositions, setError]);
  
  /**
   * Submit vote
   */
  const submitVote = useCallback(async (electionId: string): Promise<VoteConfirmation> => {
    if (!canVote) {
      throw new Error('Cannot submit vote at this time');
    }
    
    if (Object.keys(selections).length === 0) {
      throw new Error('Please select at least one candidate');
    }
    
    setSubmitting(true);
    setSubmissionProgress({ stage: 'submitting', message: 'Submitting your vote...' });
    setError(null);
    
    try {
      // Submit vote with selections
      const confirmation = await voteSubmitVote({
        batchId: batchId!,
        encryptedVote: JSON.stringify(selections),
        zkProof: ''
      });
      
      setSubmissionProgress({ stage: 'confirming', message: 'Confirming transaction...' });
      
      setConfirmation(confirmation);
      setBatchInfo({ batchStatus: 'completed' });
      
      return confirmation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit vote';
      setError({
        code: 'SUBMIT_VOTE_ERROR',
        title: 'Vote Submission Failed',
        message
      });
      throw err;
    } finally {
      setSubmitting(false);
      setSubmissionProgress(null);
    }
  }, [
    batchId,
    canVote,
    selections,
    setSubmitting,
    setSubmissionProgress,
    setConfirmation,
    setBatchInfo,
    setError
  ]);
  
  /**
   * Select candidate for a position
   */
  const vote = useCallback((positionId: string, candidateId: string) => {
    selectCandidate(positionId, candidateId);
  }, [selectCandidate]);
  
  /**
   * Remove vote for a position
   */
  const unvote = useCallback((positionId: string) => {
    clearSelection(positionId);
  }, [clearSelection]);
  
  /**
   * Get selected candidate for a position
   */
  const getSelection = useCallback((positionId: string): string | undefined => {
    return selections[positionId];
  }, [selections]);
  
  /**
   * Check if all required positions have selections
   */
  const isBallotComplete = useCallback((): boolean => {
    return positions.every(position => {
      // For positions with maxCandidates = 0, no selection is required
      if (position.maxCandidates === 0) return true;
      return !!selections[position.id];
    });
  }, [positions, selections]);
  
  /**
   * Get count of positions with selections
   */
  const selectedCount = Object.keys(selections).length;
  
  /**
   * Get total positions that require selection
   */
  const requiredSelections = positions.filter(p => p.maxCandidates > 0).length;
  
  /**
   * Reset voting state
   */
  const resetVoting = useCallback(() => {
    reset();
  }, [reset]);
  
  // Timer for batch countdown
  useEffect(() => {
    if (!isInBatch || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      const remaining = timeRemaining - 1;
      
      if (remaining <= 0) {
        setBatchInfo({ 
          timeRemaining: 0,
          batchStatus: 'expired' as BatchStatus
        });
      } else {
        setBatchInfo({ timeRemaining: remaining });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isInBatch, timeRemaining, setBatchInfo]);
  
  return {
    // Batch State
    batchId,
    batchStatus,
    positionInBatch,
    totalInBatch,
    timeRemaining,
    isInBatch,
    canVote,
    
    // Ballot State
    positions,
    selections,
    selectedCount,
    requiredSelections,
    
    // UI State
    isLoading,
    isSubmitting,
    submissionProgress,
    confirmation,
    error,
    
    // Actions
    joinBatch,
    leaveBatch,
    loadBallot,
    submitVote,
    vote,
    unvote,
    getSelection,
    isBallotComplete,
    clearAllSelections,
    resetVoting
  };
}

// Helper function to calculate time remaining from batch
function calculateTimeRemaining(batch: Batch): number {
  if (!batch.startTime) return 0;
  
  const startTime = new Date(batch.startTime).getTime();
  const endTime = startTime + (10 * 60 * 1000); // 10 minutes typical batch duration
  const now = Date.now();
  
  return Math.max(0, Math.floor((endTime - now) / 1000));
}

export default useVoting;
