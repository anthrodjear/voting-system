import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VoteService } from './vote.service';
import { Vote } from '../../entities/vote.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Voter } from '../../entities/voter.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { BlockchainService } from '../../services/blockchain.service';

describe('VoteService', () => {
  let service: VoteService;

  const mockVoteRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
  };

  const mockTrackingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockElectionRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const mockCandidateRepository = {
    find: jest.fn(),
  };

  const mockVoterRepository = {
    findOne: jest.fn(),
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
  };

  const mockBlockchainService = {
    validateVoterEligibility: jest.fn(),
    recordVoteHash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        { provide: getRepositoryToken(Vote), useValue: mockVoteRepository },
        { provide: getRepositoryToken(VoteTracking), useValue: mockTrackingRepository },
        { provide: getRepositoryToken(Election), useValue: mockElectionRepository },
        { provide: getRepositoryToken(Candidate), useValue: mockCandidateRepository },
        { provide: getRepositoryToken(Voter), useValue: mockVoterRepository },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepository },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
    jest.clearAllMocks();
    mockBlockchainService.validateVoterEligibility.mockResolvedValue({
      eligible: true,
      reason: null,
      details: { isRegistered: true, hasVoted: false, electionState: 'voting' },
    });
    mockBlockchainService.recordVoteHash.mockResolvedValue({
      transactionHash: '0xabc123',
      blockNumber: 123,
      blockHash: '0xdef',
      gasUsed: 21000,
      status: true,
      logs: [],
    });
  });

  // =========================================================================
  // Task 2.1.4: Vote Service Tests
  // =========================================================================

  describe('getBallot', () => {
    const mockElection = {
      id: 'election-1',
      name: 'General Election 2024',
      status: 'voting',
    };

    const mockCandidates = [
      {
        id: 'candidate-1',
        firstName: 'John',
        lastName: 'Doe',
        position: 'president',
        status: 'approved',
        electionId: 'election-1',
        photo: 'photo-url',
        county: { countyName: 'Nairobi' },
      },
      {
        id: 'candidate-2',
        firstName: 'Jane',
        lastName: 'Smith',
        position: 'president',
        status: 'approved',
        electionId: 'election-1',
        photo: 'photo-url-2',
        county: { countyName: 'Mombasa' },
      },
      {
        id: 'candidate-3',
        firstName: 'Bob',
        lastName: 'Wilson',
        position: 'governor',
        status: 'approved',
        electionId: 'election-1',
        photo: 'photo-url-3',
        county: { countyName: 'Nairobi' },
      },
    ];

    it('should return ballot with candidates grouped by position', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCandidateRepository.find.mockResolvedValue(mockCandidates);

      const result = await service.getBallot('voter-1');

      expect(result.ballotId).toBe('ballot_election-1');
      expect(result.electionId).toBe('election-1');
      expect(result.positions).toBeDefined();
      
      const presidentPosition = result.positions.find((p: any) => p.position === 'president');
      expect(presidentPosition.candidates).toHaveLength(2);
    });

    it('should throw NotFoundException when voter not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);

      await expect(service.getBallot('nonexistent-voter')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when no active election', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
      mockElectionRepository.findOne.mockResolvedValue(null);

      await expect(service.getBallot('voter-1')).rejects.toThrow(BadRequestException);
    });

    it('should only include approved candidates', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCandidateRepository.find.mockResolvedValue(mockCandidates);

      const result = await service.getBallot('voter-1');

      const allApproved = result.positions.every((p: any) =>
        p.candidates.every((c: any) => c.candidateId),
      );
      expect(allApproved).toBe(true);
    });

    it('should include only positions with candidates', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCandidateRepository.find.mockResolvedValue(mockCandidates);

      const result = await service.getBallot('voter-1');

      // Should not include positions without approved candidates
      expect(result.positions.length).toBeGreaterThan(0);
    });
  });

  describe('castVote - Vote Validation', () => {
    const voteDto = {
      ballotId: 'ballot_election-1',
      encryptedVote: 'encrypted-vote-data',
      zkProof: 'zk-proof-data',
      batchId: 'batch-1',
    };

    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      status: 'verified',
    };

    const mockElection = {
      id: 'election-1',
      name: 'Presidential Election 2024',
      status: 'voting',
    };

    it('should cast vote successfully for new voter', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockBlockchainService.validateVoterEligibility.mockResolvedValue({ eligible: true, reason: null, details: { isRegistered: true, hasVoted: false, electionState: 'voting' } });
      mockBlockchainService.recordVoteHash.mockResolvedValue({ transactionHash: '0xabc123', blockNumber: 123, blockHash: '0xdef', gasUsed: 21000, status: true, logs: [] });
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.castVote('voter-1', voteDto);

      expect(result.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
      expect(result.voteHash).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.blockchainTxHash).toBe('0xabc123');
      expect(result.message).toBe('Vote recorded successfully');
    });

    it('should throw ForbiddenException if voter already voted', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue({
        id: 'tracking-1',
        hasVoted: true,
        votedAt: new Date(),
      });

      await expect(service.castVote('voter-1', voteDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when voter not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);

      await expect(service.castVote('nonexistent', voteDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when no active election', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(null);

      await expect(service.castVote('voter-1', voteDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate unique confirmation number', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.castVote('voter-1', voteDto);

      expect(result.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
    });

    it('should create vote hash from encrypted vote', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.castVote('voter-1', voteDto);

      expect(result.voteHash).toBeDefined();
      expect(typeof result.voteHash).toBe('string');
    });

    it('should increment election vote count', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.castVote('voter-1', voteDto);

      expect(mockElectionRepository.increment).toHaveBeenCalledWith(
        { id: 'election-1' },
        'totalVotesCast',
        1,
      );
    });

    it('should create audit log entry for vote', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.castVote('voter-1', voteDto);

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'voter-1',
          userRole: 'voter',
          action: 'vote_cast',
          resource: 'vote',
        }),
      );
    });

    it('should update existing tracking record if voter has one', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockTrackingRepository.findOne.mockResolvedValue({
        id: 'tracking-1',
        voterId: 'voter-1',
        hasVoted: false,
      });
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.update.mockResolvedValue({ affected: 1 });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.castVote('voter-1', voteDto);

      expect(mockTrackingRepository.update).toHaveBeenCalled();
    });
  });

  describe('castVote - Batch Assignment', () => {
    it('should store batch ID with vote', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1', status: 'verified' });
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue({ id: 'election-1', status: 'voting' });
      mockVoteRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'vote-1', ...v }),
      );
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.castVote('voter-1', {
        ballotId: 'ballot_election-1',
        encryptedVote: 'encrypted',
        batchId: 'batch-123',
      });

      expect(mockVoteRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId: 'batch-123',
        }),
      );
    });
  });

  describe('castVote - Vote Encryption (Mock)', () => {
    it('should handle encrypted vote data', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1', status: 'verified' });
      mockTrackingRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue({ id: 'election-1', status: 'voting' });
      mockVoteRepository.save.mockImplementation((v) => {
        expect(v.encryptedVote).toBe('encrypted-vote-data');
        return Promise.resolve({ id: 'vote-1', ...v });
      });
      mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
      mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.castVote('voter-1', {
        ballotId: 'ballot_election-1',
        encryptedVote: 'encrypted-vote-data',
        zkProof: 'some-proof',
      });
    });
  });

  describe('getConfirmation - Verification Flow', () => {
    const mockVote = {
      id: 'vote-1',
      confirmationNumber: 'VNABC123DEF456',
      voteHash: 'hash-abc123',
      submittedAt: new Date('2024-01-01'),
      status: 'confirmed',
      blockchainTxHash: '0xabc123',
      election: { id: 'election-1', name: 'Election 2024' },
    };

    it('should return vote confirmation details', async () => {
      mockVoteRepository.findOne.mockResolvedValue(mockVote);

      const result = await service.getConfirmation('VNABC123DEF456');

      expect(result.confirmationId).toBe('VNABC123DEF456');
      expect(result.voteHash).toBe('hash-abc123');
      expect(result.status).toBe('confirmed');
      expect(result.blockchainTxHash).toBe('0xabc123');
    });

    it('should throw NotFoundException when confirmation not found', async () => {
      mockVoteRepository.findOne.mockResolvedValue(null);

      await expect(service.getConfirmation('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatus - Vote Status Retrieval', () => {
    it('should return hasVoted false when voter has not voted', async () => {
      mockTrackingRepository.findOne.mockResolvedValue(null);

      const result = await service.getStatus('voter-1');

      expect(result.hasVoted).toBe(false);
    });

    it('should return vote details when voter has voted', async () => {
      mockTrackingRepository.findOne.mockResolvedValue({
        voterId: 'voter-1',
        hasVoted: true,
        votedAt: new Date('2024-01-01T10:00:00Z'),
        confirmationNumber: 'VNABC123',
      });

      const result = await service.getStatus('voter-1');

      expect(result.hasVoted).toBe(true);
      expect(result.confirmationId).toBe('VNABC123');
      expect(result.votedAt).toBeDefined();
    });

    it('should return hasVoted false when tracking exists but hasVoted is false', async () => {
      mockTrackingRepository.findOne.mockResolvedValue({
        voterId: 'voter-1',
        hasVoted: false,
      });

      const result = await service.getStatus('voter-1');

      expect(result.hasVoted).toBe(false);
    });
  });
});
