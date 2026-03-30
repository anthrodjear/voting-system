import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { RoApplication } from '../../entities/ro-application.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AdminService', () => {
  let service: AdminService;

  const mockCountyRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockConstituencyRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWardRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRoApplicationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockRoRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockCandidateRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockPresidentialRepository = {
    save: jest.fn(),
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(County), useValue: mockCountyRepository },
        { provide: getRepositoryToken(Constituency), useValue: mockConstituencyRepository },
        { provide: getRepositoryToken(Ward), useValue: mockWardRepository },
        { provide: getRepositoryToken(RoApplication), useValue: mockRoApplicationRepository },
        { provide: getRepositoryToken(ReturningOfficer), useValue: mockRoRepository },
        { provide: getRepositoryToken(Candidate), useValue: mockCandidateRepository },
        { provide: getRepositoryToken(PresidentialCandidate), useValue: mockPresidentialRepository },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  // =========================================================================
  // Task 2.1.5: Admin Service Tests
  // =========================================================================

  describe('createCounty', () => {
    const createCountyDto = {
      countyCode: 'NBO',
      countyName: 'Nairobi',
      region: 'Central',
      capital: 'Nairobi',
      population: 4500000,
      areaSqKm: 696,
    };

    it('should create county successfully', async () => {
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'county-1', ...c }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.createCounty(createCountyDto, 'admin-1');

      expect(result.countyCode).toBe('NBO');
      expect(result.countyName).toBe('Nairobi');
    });

    it('should throw ConflictException if county code already exists', async () => {
      mockCountyRepository.findOne.mockResolvedValue({ id: 'existing-county' });

      await expect(service.createCounty(createCountyDto, 'admin-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create audit log entry', async () => {
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'county-1', ...c }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.createCounty(createCountyDto, 'admin-1');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin-1',
          userRole: 'admin',
          action: 'county_created',
          resource: 'county',
        }),
      );
    });
  });

  describe('findAllCounties', () => {
    it('should return all active counties', async () => {
      const mockCounties = [
        { id: 'county-1', countyName: 'Nairobi', isActive: true },
        { id: 'county-2', countyName: 'Mombasa', isActive: true },
      ];
      mockCountyRepository.find.mockResolvedValue(mockCounties);

      const result = await service.findAllCounties();

      expect(result).toEqual(mockCounties);
      expect(mockCountyRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('submitRoApplication - User Management', () => {
    const roApplicationDto = {
      nationalId: '12345678',
      fullName: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '+254700000000',
      preferredCounty1: 'Nairobi',
      preferredCounty2: 'Mombasa',
      previousExperience: '5 years in electoral management',
      documents: [{ type: 'id', data: 'base64data1' }, { type: 'cert', data: 'base64data2' }],
    };

    it('should submit RO application for new RO', async () => {
      mockRoRepository.findOne.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockRoRepository.save.mockImplementation((ro) =>
        Promise.resolve({ id: 'ro-1', ...ro }),
      );
      mockRoApplicationRepository.save.mockImplementation((app) =>
        Promise.resolve({ id: 'app-1', ...app }),
      );

      const result = await service.submitRoApplication(roApplicationDto);

      expect(result.applicationId).toBeDefined();
      expect(result.status).toBe('submitted');
      expect(result.message).toBe('Application submitted. Waiting for approval.');
    });

    it('should use existing RO if already registered', async () => {
      mockRoRepository.findOne.mockResolvedValue({ id: 'existing-ro' });
      mockRoApplicationRepository.save.mockImplementation((app) =>
        Promise.resolve({ id: 'app-1', ...app }),
      );

      const result = await service.submitRoApplication(roApplicationDto);

      expect(result.applicationId).toBeDefined();
    });

    it('should create RO with temporary password', async () => {
      mockRoRepository.findOne.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockRoRepository.save.mockImplementation((ro) => {
        expect(ro.passwordHash).toBeDefined();
        return Promise.resolve({ id: 'ro-1', ...ro });
      });
      mockRoApplicationRepository.save.mockImplementation((app) =>
        Promise.resolve({ id: 'app-1', ...app }),
      );

      await service.submitRoApplication(roApplicationDto);
    });

    it('should set application status to submitted', async () => {
      mockRoRepository.findOne.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockRoRepository.save.mockImplementation((ro) =>
        Promise.resolve({ id: 'ro-1', ...ro }),
      );
      mockRoApplicationRepository.save.mockImplementation((app) => {
        expect(app.status).toBe('submitted');
        return Promise.resolve({ id: 'app-1', ...app });
      });

      await service.submitRoApplication(roApplicationDto);
    });
  });

  describe('findAllRoApplications - Application Queries', () => {
    const mockApplications = [
      {
        id: 'app-1',
        status: 'submitted',
        preferredCounty1: 'Nairobi',
        submittedAt: new Date(),
        returningOfficer: { firstName: 'John', lastName: 'Doe' },
      },
      {
        id: 'app-2',
        status: 'pending',
        preferredCounty1: 'Mombasa',
        submittedAt: new Date(),
        returningOfficer: { firstName: 'Jane', lastName: 'Smith' },
      },
    ];

    it('should return all RO applications with pagination', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(mockApplications),
      };
      mockRoApplicationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAllRoApplications({});

      expect(result.applications).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by status', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockApplications[0]]),
      };
      mockRoApplicationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAllRoApplications({ status: 'submitted' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'app.status = :status',
        { status: 'submitted' },
      );
    });

    it('should filter by county', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockApplications[0]]),
      };
      mockRoApplicationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAllRoApplications({ county: 'Nairobi' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'app.preferredCounty1 = :county OR app.preferredCounty2 = :county',
        { county: 'Nairobi' },
      );
    });
  });

  describe('reviewRoApplication - Approval Workflows', () => {
    const mockApplication = {
      id: 'app-1',
      roId: 'ro-1',
      status: 'submitted',
      preferredCounty1: 'Nairobi',
      returningOfficer: { firstName: 'John', lastName: 'Doe' },
    };

    it('should approve RO application and assign county', async () => {
      mockRoApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockRoApplicationRepository.update.mockResolvedValue({ affected: 1 });
      mockRoRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.reviewRoApplication(
        'app-1',
        { action: 'approve', assignedCounty: 'Nairobi' },
        'admin-1',
      );

      expect(result.status).toBe('approved');
      expect(result.assignedCounty).toBe('Nairobi');
    });

    it('should reject RO application with notes', async () => {
      mockRoApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockRoApplicationRepository.update.mockResolvedValue({ affected: 1 });
      mockRoRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.reviewRoApplication(
        'app-1',
        { action: 'reject', notes: 'Insufficient experience' },
        'admin-1',
      );

      expect(result.status).toBe('rejected');
    });

    it('should throw NotFoundException when application not found', async () => {
      mockRoApplicationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.reviewRoApplication(
          'nonexistent',
          { action: 'approve', assignedCounty: 'Nairobi' },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update RO status to approved on acceptance', async () => {
      mockRoApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockRoApplicationRepository.update.mockResolvedValue({ affected: 1 });
      mockRoRepository.update.mockResolvedValue({ affected: 1 });

      await service.reviewRoApplication(
        'app-1',
        { action: 'approve', assignedCounty: 'Nairobi' },
        'admin-1',
      );

      expect(mockRoRepository.update).toHaveBeenCalledWith('ro-1', {
        status: 'approved',
        assignedCountyName: 'Nairobi',
        assignedCountyId: expect.any(String),
      });
    });
  });

  describe('createPresidentialCandidate - Report Generation', () => {
    const createPresidentialDto = {
      fullName: 'John Doe',
      dateOfBirth: '1970-01-01',
      party: 'Party A',
      photo: 'photo-url',
      manifesto: 'My presidential platform',
      deputyName: 'Jane Doe',
      deputyDateOfBirth: '1975-01-01',
      campaignSlogan: 'A Better Future',
    };

    it('should create presidential candidate successfully', async () => {
      mockCandidateRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'candidate-1', ...c }),
      );
      mockPresidentialRepository.save.mockImplementation((pc) => {
        expect(pc.candidateId).toBe('candidate-1');
        return Promise.resolve({ id: 'pres-1', ...pc });
      });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.createPresidentialCandidate(
        createPresidentialDto,
        'admin-1',
      );

      expect(result.candidateId).toBeDefined();
      expect(result.status).toBe('approved');
    });

    it('should auto-approve presidential candidate', async () => {
      mockCandidateRepository.save.mockImplementation((c) => {
        expect(c.status).toBe('approved');
        expect(c.approvedAt).toBeDefined();
        return Promise.resolve({ id: 'candidate-1', ...c });
      });
      mockPresidentialRepository.save.mockImplementation((pc) =>
        Promise.resolve({ id: 'pres-1', ...pc }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.createPresidentialCandidate(createPresidentialDto, 'admin-1');
    });

    it('should create presidential candidate record with deputy info', async () => {
      mockCandidateRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'candidate-1', ...c }),
      );
      mockPresidentialRepository.save.mockImplementation((pc) => {
        expect(pc.deputyFullName).toBe('Jane Doe');
        expect(pc.campaignSlogan).toBe('A Better Future');
        return Promise.resolve({ id: 'pres-1', ...pc });
      });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.createPresidentialCandidate(createPresidentialDto, 'admin-1');
    });

    it('should create audit log for presidential candidate', async () => {
      mockCandidateRepository.save.mockImplementation((c) =>
        Promise.resolve({ id: 'candidate-1', ...c }),
      );
      mockPresidentialRepository.save.mockImplementation((pc) =>
        Promise.resolve({ id: 'pres-1', ...pc }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.createPresidentialCandidate(createPresidentialDto, 'admin-1');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin-1',
          userRole: 'admin',
          action: 'presidential_candidate_created',
          resource: 'candidate',
        }),
      );
    });

    it('should generate candidate number with PRES prefix', async () => {
      mockCandidateRepository.save.mockImplementation((c) => {
        expect(c.candidateNumber).toMatch(/^PRES\d{4}$/);
        return Promise.resolve({ id: 'candidate-1', ...c });
      });
      mockPresidentialRepository.save.mockImplementation((pc) =>
        Promise.resolve({ id: 'pres-1', ...pc }),
      );
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.createPresidentialCandidate(createPresidentialDto, 'admin-1');
    });
  });
});
