import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Election } from '../../entities/election.entity';
import { AuditLog } from '../../entities/audit-log.entity';

describe('CandidateService', () => {
  let service: CandidateService;

  const mockCandidateRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockPresidentialRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockCountyRepository = {
    findOne: jest.fn(),
  };

  const mockConstituencyRepository = {
    findOne: jest.fn(),
  };

  const mockElectionRepository = {
    findOne: jest.fn(),
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: getRepositoryToken(Candidate), useValue: mockCandidateRepository },
        { provide: getRepositoryToken(PresidentialCandidate), useValue: mockPresidentialRepository },
        { provide: getRepositoryToken(County), useValue: mockCountyRepository },
        { provide: getRepositoryToken(Constituency), useValue: mockConstituencyRepository },
        { provide: getRepositoryToken(Election), useValue: mockElectionRepository },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepository },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    jest.clearAllMocks();
  });

  // =========================================================================
  // Task 2.1.3: Candidate Service Tests
  // =========================================================================

  describe('create - CRUD Operations', () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      position: 'president',
      party: 'Party A',
      partyAbbreviation: 'PA',
      dateOfBirth: '1970-01-01',
      county: 'Nairobi',
      photo: 'photo-url',
      manifesto: 'My manifesto',
      highlights: ['point1', 'point2'],
    };

    const mockElection = {
      id: 'election-1',
      name: 'General Election 2024',
      status: 'voting',
    };

    it('should create candidate successfully', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCountyRepository.findOne.mockResolvedValue({ id: 'county-1', countyName: 'Nairobi' });
      mockCandidateRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'candidate-1', ...c }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.create(createDto, 'admin-1', 'admin');

      expect(result.candidateId).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.message).toBe('Pending approval');
    });

    it('should throw ConflictException if candidate with same name and position exists', async () => {
      mockCandidateRepository.findOne.mockResolvedValue({
        id: 'existing-candidate',
        firstName: 'John',
        lastName: 'Doe',
        position: 'president',
      });

      await expect(service.create(createDto, 'admin-1', 'admin')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should generate unique candidate number', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockCandidateRepository.save.mockImplementation((c) => {
        expect(c.candidateNumber).toMatch(/^PRES\d{4}$/);
        return Promise.resolve({ id: 'candidate-1', ...c });
      });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.create(createDto, 'admin-1', 'admin');
    });

    it('should set status to pending on creation', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCandidateRepository.save.mockImplementation((c) => {
        expect(c.status).toBe('pending');
        return Promise.resolve({ id: 'candidate-1', ...c });
      });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.create(createDto, 'admin-1', 'admin');
    });

    it('should create audit log entry', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);
      mockElectionRepository.findOne.mockResolvedValue(mockElection);
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockCandidateRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'candidate-1', ...c }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.create(createDto, 'admin-1', 'admin');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin-1',
          userRole: 'admin',
          action: 'candidate_created',
          resource: 'candidate',
        }),
      );
    });
  });

  describe('findAll - Search and Filter', () => {
    const mockCandidates = [
      {
        id: 'candidate-1',
        firstName: 'John',
        lastName: 'Doe',
        middleName: '',
        position: 'president',
        partyName: 'Party A',
        partyAbbreviation: 'PA',
        photo: 'photo-url',
        status: 'approved',
        county: { countyName: 'Nairobi' },
        countyName: 'Nairobi',
      },
      {
        id: 'candidate-2',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: '',
        position: 'president',
        partyName: 'Party B',
        partyAbbreviation: 'PB',
        photo: 'photo-url-2',
        status: 'approved',
        county: { countyName: 'Mombasa' },
        countyName: 'Mombasa',
      },
    ];

    it('should return all approved candidates with pagination', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(mockCandidates),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.candidates).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter candidates by position', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockCandidates[0]]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ position: 'president' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'candidate.position = :position',
        { position: 'president' },
      );
    });

    it('should filter candidates by county', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockCandidates[0]]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ county: 'Nairobi' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'county.countyName = :county',
        { county: 'Nairobi' },
      );
    });

    it('should filter candidates by status', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockCandidates[0]]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ status: 'approved' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'candidate.status = :status',
        { status: 'approved' },
      );
    });

    it('should exclude rejected candidates from results', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({});

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'candidate.status != :excludedStatus',
        { excludedStatus: 'rejected' },
      );
    });
  });

  describe('findById', () => {
    const mockCandidate = {
      id: 'candidate-1',
      firstName: 'John',
      lastName: 'Doe',
      position: 'president',
      county: { id: 'county-1', countyName: 'Nairobi' },
      constituency: { id: 'const-1', constituencyName: 'Westlands' },
      election: { id: 'election-1', name: 'Election 2024' },
    };

    it('should return candidate by ID with relations', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);

      const result = await service.findById('candidate-1');

      expect(result).toEqual(mockCandidate);
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve - Approval Workflows', () => {
    const mockCandidate = {
      id: 'candidate-1',
      firstName: 'John',
      lastName: 'Doe',
      position: 'president',
      status: 'pending',
    };

    it('should approve candidate successfully', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);
      mockCandidateRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.approve(
        'candidate-1',
        { action: 'approve' },
        'admin-1',
      );

      expect(result.status).toBe('approved');
      expect(result.approvedAt).toBeDefined();
    });

    it('should reject candidate with reason', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);
      mockCandidateRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.approve(
        'candidate-1',
        { action: 'reject', rejectionReason: 'Incomplete documentation' },
        'admin-1',
      );

      expect(result.status).toBe('rejected');
    });

    it('should create audit log for approval', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);
      mockCandidateRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.approve('candidate-1', { action: 'approve' }, 'admin-1');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'candidate_approved',
          newValue: { status: 'approved' },
        }),
      );
    });

    it('should create audit log for rejection', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);
      mockCandidateRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.approve('candidate-1', { action: 'reject', rejectionReason: 'Failed verification' }, 'admin-1');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'candidate_rejected',
          newValue: { status: 'rejected', reason: 'Failed verification' },
        }),
      );
    });
  });

  describe('getByPosition - Election-specific Queries', () => {
    const mockCandidates = [
      { id: 'candidate-1', firstName: 'John', lastName: 'Doe', position: 'president', status: 'approved' },
      { id: 'candidate-2', firstName: 'Jane', lastName: 'Smith', position: 'president', status: 'approved' },
    ];

    it('should return approved candidates for a position', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(mockCandidates),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getByPosition('president');

      expect(result).toEqual(mockCandidates);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'candidate.position = :position',
        { position: 'president' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'candidate.status = :status',
        { status: 'approved' },
      );
    });

    it('should filter by county when specified', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockCandidates[0]]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getByPosition('president', 'Nairobi');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'county.countyName = :county',
        { county: 'Nairobi' },
      );
    });

    it('should return empty array when no candidates match', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockCandidateRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getByPosition('president');

      expect(result).toEqual([]);
    });
  });
});
