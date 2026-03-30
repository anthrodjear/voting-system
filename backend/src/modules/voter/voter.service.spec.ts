import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VoterService } from './voter.service';
import { Voter } from '../../entities/voter.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('VoterService', () => {
  let service: VoterService;

  const mockVoterRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockBiometricRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockCountyRepository = {
    findOne: jest.fn(),
  };

  const mockConstituencyRepository = {
    findOne: jest.fn(),
  };

  const mockWardRepository = {
    findOne: jest.fn(),
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoterService,
        { provide: getRepositoryToken(Voter), useValue: mockVoterRepository },
        { provide: getRepositoryToken(VoterBiometric), useValue: mockBiometricRepository },
        { provide: getRepositoryToken(County), useValue: mockCountyRepository },
        { provide: getRepositoryToken(Constituency), useValue: mockConstituencyRepository },
        { provide: getRepositoryToken(Ward), useValue: mockWardRepository },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepository },
      ],
    }).compile();

    service = module.get<VoterService>(VoterService);
    jest.clearAllMocks();
  });

  // =========================================================================
  // Task 2.1.2: Voter Service Tests
  // =========================================================================

  describe('register - Registration Validation', () => {
    const registerDto = {
      nationalId: '12345678',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      email: 'john@example.com',
      phoneNumber: '+254700000000',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Kitisuru',
    };

    it('should successfully register a new voter with all geographic data', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.findOne.mockResolvedValue({
        id: 'county-1',
        countyName: 'Nairobi',
      });
      mockConstituencyRepository.findOne.mockResolvedValue({
        id: 'const-1',
        constituencyName: 'Westlands',
      });
      mockWardRepository.findOne.mockResolvedValue({
        id: 'ward-1',
        wardName: 'Kitisuru',
      });
      mockVoterRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'voter-1', ...entity }),
      );
      mockBiometricRepository.save.mockResolvedValue({ id: 'bio-1' });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.voterId).toBeDefined();
      expect(result.status).toBe('pending_biometrics');
      expect(result.message).toBe('Please complete biometric enrollment');
    });

    it('should throw ConflictException if voter with same National ID exists', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ id: 'existing-voter' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should handle missing geographic data gracefully', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockVoterRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'voter-2', ...entity }),
      );
      mockBiometricRepository.save.mockResolvedValue({ id: 'bio-2' });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.voterId).toBeDefined();
      expect(result.status).toBe('pending_biometrics');
    });

    it('should create biometric record during registration', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.findOne.mockResolvedValue({ id: 'county-1', countyName: 'Nairobi' });
      mockVoterRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'voter-1', ...entity }),
      );

      await service.register(registerDto);

      expect(mockBiometricRepository.save).toHaveBeenCalledWith({
        voterId: 'voter-1',
      });
    });

    it('should create audit log entry for registration', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockVoterRepository.save.mockImplementation((entity) =>
        Promise.resolve({ id: 'voter-1', ...entity }),
      );
      mockBiometricRepository.save.mockResolvedValue({ id: 'bio-1' });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.register(registerDto, 'admin-1');

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin-1',
          userRole: 'system',
          action: 'voter_registered',
          resource: 'voter',
        }),
      );
    });

    it('should set status to pending_biometrics initially', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockCountyRepository.findOne.mockResolvedValue(null);
      mockVoterRepository.save.mockImplementation((entity) => {
        expect(entity.status).toBe('pending_biometrics');
        return Promise.resolve({ id: 'voter-1', ...entity });
      });
      mockBiometricRepository.save.mockResolvedValue({ id: 'bio-1' });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.register(registerDto);
    });
  });

  describe('findById - Duplicate Detection', () => {
    const mockVoterWithBiometric = {
      id: 'voter-1',
      nationalId: '12345678',
      firstName: 'John',
      lastName: 'Doe',
      status: 'verified',
      biometric: { id: 'bio-1', faceEnrolled: true, fingerprintEnrolled: true },
    };

    it('should return voter with biometric relations when found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoterWithBiometric);

      const result = await service.findById('voter-1');

      expect(result).toEqual(mockVoterWithBiometric);
      expect(mockVoterRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'voter-1' },
        relations: ['biometric'],
      });
    });

    it('should throw NotFoundException when voter not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should load biometric relation for status checks', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoterWithBiometric);

      await service.findById('voter-1');

      expect(mockVoterRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['biometric'],
        }),
      );
    });
  });

  describe('findByNationalId', () => {
    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      firstName: 'John',
      lastName: 'Doe',
      status: 'verified',
      biometric: { id: 'bio-1' },
    };

    it('should return voter by national ID', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);

      const result = await service.findByNationalId('12345678');

      expect(result).toEqual(mockVoter);
    });

    it('should throw NotFoundException when national ID not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);

      await expect(service.findByNationalId('00000000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should update voter phone number and email', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.update(
        'voter-1',
        { phoneNumber: '+254711111111', email: 'newemail@example.com' },
        'user-1',
      );

      expect(result.updated).toBe(true);
      expect(result.voterId).toBe('voter-1');
    });

    it('should create audit log for updates', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.update(
        'voter-1',
        { phoneNumber: '+254711111111' },
        'admin-1',
      );

      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'admin-1',
          userRole: 'voter',
          action: 'voter_updated',
          resource: 'voter',
        }),
      );
    });
  });

  describe('enrollBiometrics - Biometric Enrollment', () => {
    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      biometric: { id: 'bio-1' },
    };

    const completeBiometricDto = {
      faceImage: 'base64faceimage',
      faceLivenessToken: 'liveness-token-123',
      fingerprintImages: {
        leftThumb: 'base64leftthumb',
        rightThumb: 'base64rightthumb',
      },
    };

    it('should enroll both face and fingerprint biometrics', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockBiometricRepository.update.mockResolvedValue({ affected: 1 });
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.enrollBiometrics('voter-1', completeBiometricDto);

      expect(result.enrolled).toBe(true);
      expect(result.faceEnrolled).toBe(true);
      expect(result.fingerprintEnrolled).toBe(true);
    });

    it('should update voter status to verified when both biometrics enrolled', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockBiometricRepository.update.mockResolvedValue({ affected: 1 });
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });

      await service.enrollBiometrics('voter-1', completeBiometricDto);

      expect(mockVoterRepository.update).toHaveBeenCalledWith('voter-1', {
        status: 'verified',
        nationalIdVerified: true,
        verifiedAt: expect.any(Date),
      });
    });

    it('should update voter when biometric fails quality check', async () => {
      // This test validates partial enrollment doesn't update voter to verified
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockBiometricRepository.update.mockResolvedValue({ affected: 1 });

      const partialDto = {
        faceImage: 'base64faceimage',
        faceLivenessToken: 'liveness-token',
        fingerprintImages: {
          leftThumb: '',
          rightThumb: '',
        },
      };

      const result = await service.enrollBiometrics('voter-1', partialDto);

      expect(result.enrolled).toBe(false);
      // Voter status should NOT be updated to verified when enrollment is incomplete
      expect(mockVoterRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when biometric record not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue({
        ...mockVoter,
        biometric: null,
      });

      await expect(
        service.enrollBiometrics('voter-1', completeBiometricDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should store liveness challenge data', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockBiometricRepository.update.mockResolvedValue({ affected: 1 });
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });

      await service.enrollBiometrics('voter-1', completeBiometricDto);

      expect(mockBiometricRepository.update).toHaveBeenCalledWith('bio-1', {
        faceTemplate: 'base64faceimage',
        faceEnrolled: true,
        faceEnrolledAt: expect.any(Date),
        faceQualityScore: 0.85,
        leftThumbTemplate: 'base64leftthumb',
        rightThumbTemplate: 'base64rightthumb',
        fingerprintEnrolled: true,
        fingerprintEnrolledAt: expect.any(Date),
        fingerprintQualityScore: 0.9,
        livenessChallenge: 'liveness-token-123',
        livenessGeneratedAt: expect.any(Date),
      });
    });
  });

  describe('getStatus - Status Retrieval', () => {
    const mockVoter = {
      id: 'voter-1',
      status: 'verified',
      nationalIdVerified: true,
      verifiedAt: new Date('2024-01-01'),
      biometric: {
        faceEnrolled: true,
        fingerprintEnrolled: true,
      },
    };

    it('should return complete voter status with all biometric info', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);

      const result = await service.getStatus('voter-1');

      expect(result.voterId).toBe('voter-1');
      expect(result.status).toBe('verified');
      expect(result.idVerified).toBe(true);
      expect(result.faceEnrolled).toBe(true);
      expect(result.fingerprintEnrolled).toBe(true);
      expect(result.verifiedAt).toEqual(new Date('2024-01-01'));
    });

    it('should return false for biometrics when not enrolled', async () => {
      mockVoterRepository.findOne.mockResolvedValue({
        ...mockVoter,
        biometric: {},
      });

      const result = await service.getStatus('voter-1');

      expect(result.faceEnrolled).toBe(false);
      expect(result.fingerprintEnrolled).toBe(false);
    });

    it('should return pending_biometrics status correctly', async () => {
      mockVoterRepository.findOne.mockResolvedValue({
        id: 'voter-2',
        status: 'pending_biometrics',
        nationalIdVerified: false,
        biometric: { faceEnrolled: false, fingerprintEnrolled: false },
      });

      const result = await service.getStatus('voter-2');

      expect(result.status).toBe('pending_biometrics');
      expect(result.idVerified).toBe(false);
    });
  });
});
