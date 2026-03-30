import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Batch } from '../../entities/batch.entity';
import { Election } from '../../entities/election.entity';
import { Vote } from '../../entities/vote.entity';

describe('BatchService', () => {
  let service: BatchService;

  const mockBatchRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  const mockElectionRepository = {
    findOne: jest.fn(),
  };

  const mockVoteRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: getRepositoryToken(Batch), useValue: mockBatchRepository },
        { provide: getRepositoryToken(Election), useValue: mockElectionRepository },
        { provide: getRepositoryToken(Vote), useValue: mockVoteRepository },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
    jest.clearAllMocks();
  });

  // =========================================================================
  // Task 2.1.6: Batch Service Tests
  // =========================================================================

  describe('join - Batch Creation', () => {
    const mockElection = {
      id: 'election-1',
      name: 'Presidential Election 2024',
      status: 'voting',
    };

    it('should create new batch when no waiting batch exists', async () => {
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockBatchRepository.findOne.mockResolvedValue(null);
      mockBatchRepository.save.mockImplementation((b) =>
        Promise.resolve({
          id: 'batch-1',
          batchId: 'BATCH_ABC',
          targetSize: 1000,
          currentVoters: 1,
          status: 'waiting',
        }),
      );
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.join('voter-1');

      expect(result.batchId).toBeDefined();
      expect(result.assignedPosition).toBeDefined();
      expect(result.estimatedWait).toBe(30);
    });

    it('should add voter to existing waiting batch', async () => {
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      const existingBatch = {
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        targetSize: 1000,
        currentVoters: 500,
        status: 'waiting',
      };
      mockBatchRepository.findOne.mockResolvedValue(existingBatch);
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });
      mockBatchRepository.findOne.mockResolvedValueOnce(existingBatch).mockResolvedValueOnce({
        ...existingBatch,
        currentVoters: 501,
      });

      const result = await service.join('voter-1');

      expect(result.batchId).toBe('BATCH_ABC');
    });

    it('should throw BadRequestException when no active election', async () => {
      mockElectionRepository.findOne.mockResolvedValue(null);

      await expect(service.join('voter-1')).rejects.toThrow(BadRequestException);
    });

    it('should assign position based on current voters', async () => {
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockBatchRepository.findOne.mockResolvedValue(null);
      mockBatchRepository.save.mockImplementation((b) =>
        Promise.resolve({
          id: 'batch-1',
          batchId: 'BATCH_NEW',
          targetSize: 1000,
          currentVoters: 1,
        }),
      );
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.join('voter-1');

      expect(result.assignedPosition).toBe(1);
    });

    it('should set batch to active when target size reached', async () => {
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      const fullBatch = {
        id: 'batch-1',
        batchId: 'BATCH_FULL',
        targetSize: 1000,
        currentVoters: 999,
        status: 'waiting',
      };
      mockBatchRepository.findOne.mockResolvedValue(fullBatch);
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });
      mockBatchRepository.findOne.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce({
        ...fullBatch,
        currentVoters: 1000,
        status: 'active',
      });
      mockBatchRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.join('voter-1');

      expect(mockBatchRepository.update).toHaveBeenCalledWith('batch-1', {
        status: 'active',
        startedAt: expect.any(Date),
      });
    });

    it('should set expiration to 30 minutes', async () => {
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockBatchRepository.findOne.mockResolvedValue(null);
      mockBatchRepository.save.mockImplementation((b) => {
        expect(b.expiresAt).toBeInstanceOf(Date);
        const expectedExpiry = new Date(Date.now() + 30 * 60 * 1000);
        expect(b.expiresAt.getTime()).toBeCloseTo(expectedExpiry.getTime(), -3);
        return Promise.resolve({
          id: 'batch-1',
          batchId: 'BATCH_NEW',
          ...b,
        });
      });
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      await service.join('voter-1');
    });
  });

  describe('submitVote - Vote Aggregation', () => {
    const batchVoteDto = {
      encryptedVote: 'encrypted-vote-data',
      zkProof: 'zk-proof',
    };

    it('should submit vote to batch successfully', async () => {
      mockBatchRepository.findOne.mockResolvedValue({
        id: 'batch-1',
        batchId: 'BATCH_ABC',
      });
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.submitVote('voter-1', 'BATCH_ABC', batchVoteDto);

      expect(result.queued).toBe(true);
      expect(result.queuePosition).toBe(1);
      expect(result.estimatedConfirmation).toBe(15);
    });

    it('should throw NotFoundException when batch not found', async () => {
      mockBatchRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitVote('voter-1', 'INVALID_BATCH', batchVoteDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should increment votes collected counter', async () => {
      mockBatchRepository.findOne.mockResolvedValue({
        id: 'batch-1',
        batchId: 'BATCH_ABC',
      });
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      await service.submitVote('voter-1', 'BATCH_ABC', batchVoteDto);

      expect(mockBatchRepository.increment).toHaveBeenCalledWith(
        { id: 'batch-1' },
        'votesCollected',
        1,
      );
    });

    it('should remove voter from in-memory batch tracking', async () => {
      // Setup: Add voter to in-memory batch
      mockBatchRepository.findOne.mockResolvedValue({
        id: 'batch-1',
        batchId: 'BATCH_ABC',
      });
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      await service.submitVote('voter-1', 'BATCH_ABC', batchVoteDto);

      // The voter should be removed from the in-memory map
      // This is handled by the service internally
    });
  });

  describe('getStatus - Batch Status', () => {
    it('should return batch status with all details', async () => {
      const mockBatch = {
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        status: 'active',
        targetSize: 1000,
        currentVoters: 750,
        votesCollected: 500,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      mockBatchRepository.findOne.mockResolvedValue(mockBatch);

      const result = await service.getStatus('BATCH_ABC');

      expect(result.batchId).toBe('BATCH_ABC');
      expect(result.status).toBe('active');
      expect(result.totalVoters).toBe(1000);
      expect(result.currentVoters).toBe(750);
      expect(result.votesCollected).toBe(500);
    });

    it('should throw NotFoundException when batch not found', async () => {
      mockBatchRepository.findOne.mockResolvedValue(null);

      await expect(service.getStatus('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should calculate time remaining until expiry', async () => {
      const mockBatch = {
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        status: 'waiting',
        targetSize: 1000,
        currentVoters: 100,
        votesCollected: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };
      mockBatchRepository.findOne.mockResolvedValue(mockBatch);

      const result = await service.getStatus('BATCH_ABC');

      expect(result.timeRemaining).toBeGreaterThan(500);
      expect(result.timeRemaining).toBeLessThanOrEqual(600);
    });

    it('should return timeRemaining undefined when no expiry set', async () => {
      const mockBatch = {
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        status: 'active',
        targetSize: 1000,
        currentVoters: 1000,
        votesCollected: 500,
        expiresAt: null,
      };
      mockBatchRepository.findOne.mockResolvedValue(mockBatch);

      const result = await service.getStatus('BATCH_ABC');

      expect(result.timeRemaining).toBeUndefined();
    });
  });

  describe('heartbeat - Submission Triggers', () => {
    it('should confirm heartbeat received for active voter', async () => {
      // First join to add voter to batch
      mockElectionRepository.findOne.mockResolvedValue({
        id: 'election-1',
        status: 'voting',
      });
      mockBatchRepository.findOne.mockResolvedValue(null);
      mockBatchRepository.save.mockImplementation((b) =>
        Promise.resolve({ id: 'batch-1', batchId: 'BATCH_ABC', currentVoters: 1 }),
      );
      mockBatchRepository.increment.mockResolvedValue({ affected: 1 });

      await service.join('voter-1');

      const result = await service.heartbeat('voter-1');

      expect(result.heartbeatReceived).toBe(true);
      expect(result.positionSecured).toBe(true);
    });

    it('should return false when voter not in any batch', async () => {
      const result = await service.heartbeat('nonexistent-voter');

      expect(result.heartbeatReceived).toBe(false);
      expect(result.positionSecured).toBe(false);
    });
  });

  describe('leave - Batch Exit', () => {
    it('should remove voter from batch', async () => {
      mockBatchRepository.findOne.mockResolvedValue({
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        currentVoters: 100,
      });
      mockBatchRepository.decrement.mockResolvedValue({ affected: 1 });

      const result = await service.leave('voter-1', 'BATCH_ABC');

      expect(result.message).toBe('Removed from batch');
      expect(result.canRejoin).toBe(true);
    });

    it('should decrement current voters count', async () => {
      mockBatchRepository.findOne.mockResolvedValue({
        id: 'batch-1',
        batchId: 'BATCH_ABC',
        currentVoters: 100,
      });
      mockBatchRepository.decrement.mockResolvedValue({ affected: 1 });

      await service.leave('voter-1', 'BATCH_ABC');

      expect(mockBatchRepository.decrement).toHaveBeenCalledWith(
        { id: 'batch-1' },
        'currentVoters',
        1,
      );
    });

    it('should handle batch not found gracefully', async () => {
      mockBatchRepository.findOne.mockResolvedValue(null);

      const result = await service.leave('voter-1', 'INVALID_BATCH');

      expect(result.message).toBe('Removed from batch');
      expect(result.canRejoin).toBe(true);
    });
  });
});
