/**
 * @jest-environment jsdom
 */

import { useVotingStore, type BatchStatus } from './voting.store';

describe('voting.store', () => {
  // Test data factories
  const createMockPositions = () => [
    {
      id: 'position-1',
      title: 'President',
      description: 'Elect the President',
      level: 'national' as const,
      maxCandidates: 1,
      candidates: [
        { id: 'c1', name: 'Candidate A', party: 'Party A', symbol: 'A' },
        { id: 'c2', name: 'Candidate B', party: 'Party B', symbol: 'B' },
      ],
    },
    {
      id: 'position-2',
      title: 'Governor',
      description: 'Elect the Governor',
      level: 'county' as const,
      maxCandidates: 1,
      candidates: [
        { id: 'c3', name: 'Candidate C', party: 'Party C', symbol: 'C' },
      ],
    },
  ];

  const createMockConfirmation = () => ({
    confirmationNumber: 'CONF-123456',
    timestamp: new Date().toISOString(),
    txHash: '0x1234567890',
    blockNumber: 123456,
  });

  const createMockError = () => ({
    code: 'TEST_ERROR',
    title: 'Test Error',
    message: 'This is a test error',
  });

  beforeEach(() => {
    // Reset store before each test
    const store = useVotingStore.getState();
    store.reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has null batchId', () => {
      const { batchId } = useVotingStore.getState();
      expect(batchId).toBeNull();
    });

    it('has waiting batchStatus', () => {
      const { batchStatus } = useVotingStore.getState();
      expect(batchStatus).toBe('waiting');
    });

    it('has zero positionInBatch', () => {
      const { positionInBatch } = useVotingStore.getState();
      expect(positionInBatch).toBe(0);
    });

    it('has zero totalInBatch', () => {
      const { totalInBatch } = useVotingStore.getState();
      expect(totalInBatch).toBe(0);
    });

    it('has zero timeRemaining', () => {
      const { timeRemaining } = useVotingStore.getState();
      expect(timeRemaining).toBe(0);
    });

    it('has empty positions array', () => {
      const { positions } = useVotingStore.getState();
      expect(positions).toEqual([]);
    });

    it('has empty selections object', () => {
      const { selections } = useVotingStore.getState();
      expect(selections).toEqual({});
    });

    it('has isSubmitting as false', () => {
      const { isSubmitting } = useVotingStore.getState();
      expect(isSubmitting).toBe(false);
    });

    it('has null submissionProgress', () => {
      const { submissionProgress } = useVotingStore.getState();
      expect(submissionProgress).toBeNull();
    });

    it('has null confirmation', () => {
      const { confirmation } = useVotingStore.getState();
      expect(confirmation).toBeNull();
    });

    it('has null error', () => {
      const { error } = useVotingStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('setBatchInfo', () => {
    it('updates batch information', () => {
      const { setBatchInfo } = useVotingStore.getState();
      
      setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'active' as BatchStatus,
        positionInBatch: 1,
        totalInBatch: 10,
        timeRemaining: 300,
      });
      
      const state = useVotingStore.getState();
      expect(state.batchId).toBe('batch-1');
      expect(state.batchStatus).toBe('active');
      expect(state.positionInBatch).toBe(1);
      expect(state.totalInBatch).toBe(10);
      expect(state.timeRemaining).toBe(300);
    });

    it('partially updates batch information', () => {
      const { setBatchInfo } = useVotingStore.getState();
      
      // First set full batch info
      setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'active' as BatchStatus,
        positionInBatch: 1,
        totalInBatch: 10,
      });
      
      // Then partially update
      setBatchInfo({
        batchStatus: 'completed' as BatchStatus,
      });
      
      const state = useVotingStore.getState();
      expect(state.batchId).toBe('batch-1');
      expect(state.batchStatus).toBe('completed');
      expect(state.positionInBatch).toBe(1);
    });

    it('can update batchStatus only', () => {
      const { setBatchInfo } = useVotingStore.getState();
      
      setBatchInfo({ batchStatus: 'expired' as BatchStatus });
      
      const state = useVotingStore.getState();
      expect(state.batchStatus).toBe('expired');
    });

    it('can update timeRemaining only', () => {
      const { setBatchInfo } = useVotingStore.getState();
      
      setBatchInfo({ timeRemaining: 600 });
      
      const state = useVotingStore.getState();
      expect(state.timeRemaining).toBe(600);
    });
  });

  describe('setPositions', () => {
    it('sets positions array', () => {
      const { setPositions } = useVotingStore.getState();
      const positions = createMockPositions();
      
      setPositions(positions);
      
      const state = useVotingStore.getState();
      expect(state.positions).toEqual(positions);
    });

    it('replaces existing positions', () => {
      const { setPositions } = useVotingStore.getState();
      
      setPositions(createMockPositions());
      setPositions([{
        id: 'position-3',
        title: 'Senator',
        level: 'national' as const,
        maxCandidates: 1,
        candidates: [],
      }]);
      
      const state = useVotingStore.getState();
      expect(state.positions.length).toBe(1);
      expect(state.positions[0].id).toBe('position-3');
    });

    it('can set empty positions', () => {
      const { setPositions } = useVotingStore.getState();
      
      setPositions([]);
      
      const state = useVotingStore.getState();
      expect(state.positions).toEqual([]);
    });
  });

  describe('selectCandidate', () => {
    it('selects a candidate for a position', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-1': 'c1' });
    });

    it('selects multiple candidates for different positions', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      selectCandidate('position-2', 'c3');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({
        'position-1': 'c1',
        'position-2': 'c3',
      });
    });

    it('replaces existing selection for same position', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      selectCandidate('position-1', 'c2');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-1': 'c2' });
    });
  });

  describe('clearSelection', () => {
    it('clears selection for a specific position', () => {
      const { selectCandidate, clearSelection } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      selectCandidate('position-2', 'c3');
      
      clearSelection('position-1');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-2': 'c3' });
    });

    it('handles clearing non-existent selection', () => {
      const { clearSelection } = useVotingStore.getState();
      
      // Should not throw
      clearSelection('non-existent');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({});
    });

    it('clears nothing when position not selected', () => {
      const { selectCandidate, clearSelection } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      clearSelection('position-2');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-1': 'c1' });
    });
  });

  describe('clearAllSelections', () => {
    it('clears all selections', () => {
      const { selectCandidate, clearAllSelections } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      selectCandidate('position-2', 'c3');
      
      clearAllSelections();
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({});
    });

    it('works when no selections exist', () => {
      const { clearAllSelections } = useVotingStore.getState();
      
      clearAllSelections();
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({});
    });
  });

  describe('setSubmitting', () => {
    it('sets isSubmitting to true', () => {
      const { setSubmitting } = useVotingStore.getState();
      
      setSubmitting(true);
      
      expect(useVotingStore.getState().isSubmitting).toBe(true);
    });

    it('sets isSubmitting to false', () => {
      useVotingStore.setState({ isSubmitting: true });
      const { setSubmitting } = useVotingStore.getState();
      
      setSubmitting(false);
      
      expect(useVotingStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('setSubmissionProgress', () => {
    it('sets submission progress', () => {
      const { setSubmissionProgress } = useVotingStore.getState();
      const progress = {
        stage: 'encrypting' as const,
        message: 'Encrypting your vote...',
      };
      
      setSubmissionProgress(progress);
      
      const state = useVotingStore.getState();
      expect(state.submissionProgress).toEqual(progress);
    });

    it('clears submission progress when null', () => {
      const { setSubmissionProgress, setSubmitting } = useVotingStore.getState();
      
      setSubmitting(true);
      setSubmissionProgress({ stage: 'submitting', message: 'Submitting...' });
      setSubmissionProgress(null);
      
      const state = useVotingStore.getState();
      expect(state.submissionProgress).toBeNull();
    });

    it('updates progress through stages', () => {
      const { setSubmissionProgress } = useVotingStore.getState();
      
      setSubmissionProgress({ stage: 'encrypting', message: 'Encrypting...' });
      expect(useVotingStore.getState().submissionProgress?.stage).toBe('encrypting');
      
      setSubmissionProgress({ stage: 'submitting', message: 'Submitting...' });
      expect(useVotingStore.getState().submissionProgress?.stage).toBe('submitting');
      
      setSubmissionProgress({ stage: 'confirming', message: 'Confirming...' });
      expect(useVotingStore.getState().submissionProgress?.stage).toBe('confirming');
    });
  });

  describe('setConfirmation', () => {
    it('sets vote confirmation', () => {
      const { setConfirmation } = useVotingStore.getState();
      const confirmation = createMockConfirmation();
      
      setConfirmation(confirmation);
      
      const state = useVotingStore.getState();
      expect(state.confirmation).toEqual(confirmation);
    });

    it('clears confirmation when null', () => {
      const { setConfirmation } = useVotingStore.getState();
      
      setConfirmation(createMockConfirmation());
      setConfirmation(null);
      
      const state = useVotingStore.getState();
      expect(state.confirmation).toBeNull();
    });
  });

  describe('setError', () => {
    it('sets error', () => {
      const { setError } = useVotingStore.getState();
      const error = createMockError();
      
      setError(error);
      
      const state = useVotingStore.getState();
      expect(state.error).toEqual(error);
    });

    it('clears error when null', () => {
      const { setError } = useVotingStore.getState();
      
      setError(createMockError());
      setError(null);
      
      const state = useVotingStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const store = useVotingStore.getState();
      
      // Set all the state
      store.setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'active' as BatchStatus,
        positionInBatch: 1,
        totalInBatch: 10,
        timeRemaining: 300,
      });
      store.setPositions(createMockPositions());
      store.selectCandidate('position-1', 'c1');
      store.setSubmitting(true);
      store.setSubmissionProgress({ stage: 'submitting', message: 'Submitting...' });
      store.setConfirmation(createMockConfirmation());
      store.setError(createMockError());
      
      // Reset
      store.reset();
      
      const state = useVotingStore.getState();
      expect(state.batchId).toBeNull();
      expect(state.batchStatus).toBe('waiting');
      expect(state.positionInBatch).toBe(0);
      expect(state.totalInBatch).toBe(0);
      expect(state.timeRemaining).toBe(0);
      expect(state.positions).toEqual([]);
      expect(state.selections).toEqual({});
      expect(state.isSubmitting).toBe(false);
      expect(state.submissionProgress).toBeNull();
      expect(state.confirmation).toBeNull();
      expect(state.error).toBeNull();
    });

    it('can reset multiple times', () => {
      const { setBatchInfo, reset } = useVotingStore.getState();
      
      setBatchInfo({ batchId: 'batch-1' });
      reset();
      
      setBatchInfo({ batchId: 'batch-2' });
      reset();
      
      expect(useVotingStore.getState().batchId).toBeNull();
    });
  });

  describe('Complete Voting Flow', () => {
    it('handles complete voting workflow', () => {
      const store = useVotingStore.getState();
      
      // 1. Join batch
      store.setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'waiting',
        positionInBatch: 1,
        totalInBatch: 10,
        timeRemaining: 600,
      });
      expect(useVotingStore.getState().batchId).toBe('batch-1');
      
      // 2. Batch becomes active
      store.setBatchInfo({ batchStatus: 'active' });
      expect(useVotingStore.getState().batchStatus).toBe('active');
      
      // 3. Load ballot
      store.setPositions(createMockPositions());
      expect(useVotingStore.getState().positions.length).toBe(2);
      
      // 4. Make selections
      store.selectCandidate('position-1', 'c1');
      store.selectCandidate('position-2', 'c3');
      expect(useVotingStore.getState().selections).toEqual({
        'position-1': 'c1',
        'position-2': 'c3',
      });
      
      // 5. Start submission
      store.setSubmitting(true);
      store.setSubmissionProgress({ stage: 'encrypting', message: 'Encrypting...' });
      expect(useVotingStore.getState().isSubmitting).toBe(true);
      
      // 6. Submit progress
      store.setSubmissionProgress({ stage: 'submitting', message: 'Submitting...' });
      store.setSubmissionProgress({ stage: 'confirming', message: 'Confirming...' });
      
      // 7. Complete submission
      store.setConfirmation(createMockConfirmation());
      store.setBatchInfo({ batchStatus: 'completed' });
      store.setSubmitting(false);
      store.setSubmissionProgress(null);
      
      const finalState = useVotingStore.getState();
      expect(finalState.confirmation).not.toBeNull();
      expect(finalState.batchStatus).toBe('completed');
      
      // 8. Reset for next vote
      store.reset();
      const resetState = useVotingStore.getState();
      expect(resetState.batchId).toBeNull();
      expect(resetState.selections).toEqual({});
    });
  });

  describe('Error Handling Flow', () => {
    it('handles error during voting', () => {
      const store = useVotingStore.getState();
      
      // Set up batch
      store.setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'active',
        timeRemaining: 300,
      });
      
      // Try to submit with no selections
      store.selectCandidate('position-1', 'c1');
      
      // Set submission
      store.setSubmitting(true);
      
      // Error occurs
      store.setError({
        code: 'SUBMIT_ERROR',
        title: 'Submission Failed',
        message: 'Network error',
      });
      
      expect(useVotingStore.getState().error).not.toBeNull();
      expect(useVotingStore.getState().error?.code).toBe('SUBMIT_ERROR');
      
      // Clear error
      store.setError(null);
      store.setSubmitting(false);
      
      expect(useVotingStore.getState().error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid selection changes', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      // Rapidly change selection
      selectCandidate('position-1', 'c1');
      selectCandidate('position-1', 'c2');
      selectCandidate('position-1', 'c1');
      selectCandidate('position-1', 'c2');
      
      expect(useVotingStore.getState().selections['position-1']).toBe('c2');
    });

    it('handles clearing selections while submitting', () => {
      const { selectCandidate, clearAllSelections, setSubmitting } = useVotingStore.getState();
      
      selectCandidate('position-1', 'c1');
      setSubmitting(true);
      clearAllSelections();
      
      expect(useVotingStore.getState().selections).toEqual({});
      expect(useVotingStore.getState().isSubmitting).toBe(true);
    });

    it('handles batch timeout', () => {
      const { setBatchInfo } = useVotingStore.getState();
      
      setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'active',
        timeRemaining: 10,
      });
      
      // Timer ticks down
      setBatchInfo({ timeRemaining: 5 });
      expect(useVotingStore.getState().timeRemaining).toBe(5);
      
      // Expired
      setBatchInfo({ timeRemaining: 0, batchStatus: 'expired' });
      expect(useVotingStore.getState().batchStatus).toBe('expired');
      expect(useVotingStore.getState().timeRemaining).toBe(0);
    });
  });
});
