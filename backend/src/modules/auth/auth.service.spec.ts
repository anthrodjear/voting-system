import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { Session } from '../../entities/session.entity';
import { LoginHistory } from '../../entities/login-history.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;

  const mockVoterRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockRoRepository = {
    findOne: jest.fn(),
  };

  const mockAdminRepository = {
    findOne: jest.fn(),
  };

  const mockSessionRepository = {
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockLoginHistoryRepository = {
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(900000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Voter), useValue: mockVoterRepository },
        { provide: getRepositoryToken(ReturningOfficer), useValue: mockRoRepository },
        { provide: getRepositoryToken(SuperAdmin), useValue: mockAdminRepository },
        { provide: getRepositoryToken(Session), useValue: mockSessionRepository },
        { provide: getRepositoryToken(LoginHistory), useValue: mockLoginHistoryRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // =========================================================================
  // Task 2.1.1: Auth Service Tests
  // =========================================================================

  describe('login - Login Validation', () => {
    const loginDto: { identifier: string; password: string; userType?: 'voter' | 'ro' | 'admin' } = {
      identifier: '12345678',
      password: 'password123',
      userType: 'voter',
    };

    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      email: 'john@example.com',
      passwordHash: 'hashedpassword',
      status: 'verified',
      failedLoginAttempts: 0,
      mfaEnabled: false,
      isActive: true,
    };

    it('should successfully login a voter with valid credentials', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-12345');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-1' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto, '192.168.1.1', 'Mozilla/5.0');

      expect(result.accessToken).toBe('jwt-token-12345');
      expect(result.refreshToken).toBeDefined();
      expect(result.requiresMfa).toBe(false);
      expect(result.expiresIn).toBe(900);
    });

    it('should throw UnauthorizedException when voter not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockRoRepository.findOne.mockResolvedValue(null);
      mockAdminRepository.findOne.mockResolvedValue(null);
      mockLoginHistoryRepository.save.mockResolvedValue({});

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      mockLoginHistoryRepository.save.mockResolvedValue({});

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failed login attempts on invalid password', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      mockLoginHistoryRepository.save.mockResolvedValue({});
      mockVoterRepository.update.mockResolvedValue({ affected: 1 });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockVoterRepository.update).toHaveBeenCalledWith('voter-1', {
        failedLoginAttempts: 1,
      });
    });

    it('should throw UnauthorizedException when account is deactivated', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ ...mockVoter, isActive: false });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockLoginHistoryRepository.save.mockResolvedValue({});

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return requiresMfa true when MFA is enabled', async () => {
      mockVoterRepository.findOne.mockResolvedValue({ ...mockVoter, mfaEnabled: true });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-12345');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-1' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.requiresMfa).toBe(true);
    });

    it('should login returning officer successfully', async () => {
      const mockRO = {
        id: 'ro-1',
        email: 'ro@example.com',
        passwordHash: 'hashedpassword',
        isActive: true,
      };
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockRoRepository.findOne.mockResolvedValue(mockRO);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-ro');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-ro' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      const roLoginDto = { identifier: 'ro@example.com', password: 'password123', userType: 'ro' as const };
      const result = await service.login(roLoginDto);

      expect(result.accessToken).toBe('jwt-token-ro');
    });

    it('should login admin successfully', async () => {
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@example.com',
        passwordHash: 'hashedpassword',
        isActive: true,
      };
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockRoRepository.findOne.mockResolvedValue(null);
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-admin');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-admin' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      const adminLoginDto = { identifier: 'admin@example.com', password: 'password123', userType: 'admin' as const };
      const result = await service.login(adminLoginDto);

      expect(result.accessToken).toBe('jwt-token-admin');
    });
  });

  describe('login - JWT Token Generation', () => {
    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      email: 'john@example.com',
      passwordHash: 'hashedpassword',
      status: 'verified',
      isActive: true,
    };

    it('should generate JWT token with correct payload', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-12345');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-1' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      await service.login({ identifier: '12345678', password: 'password123' });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'voter-1',
          email: 'john@example.com',
          role: 'voter',
          userType: 'voter',
        }),
      );
    });

    it('should save session with token hash', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('token-hash');
      mockJwtService.sign.mockReturnValue('jwt-token-12345');
      mockSessionRepository.save.mockResolvedValue({ id: 'session-1' });
      mockLoginHistoryRepository.save.mockResolvedValue({});

      await service.login({ identifier: '12345678', password: 'password123' });

      expect(mockSessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'voter-1',
          userType: 'voter',
        }),
      );
    });
  });

  
  describe('refreshToken', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'voter-1',
      userType: 'voter',
      expiresAt: new Date(Date.now() + 3600000),
    };

    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      email: 'john@example.com',
      isActive: true,
    };

    it('should refresh token with valid session', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockJwtService.sign.mockReturnValue('new-jwt-token');
      mockSessionRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-jwt-token');
      expect(result.expiresIn).toBe(900);
    });

    it('should throw UnauthorizedException when session not found', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session expired', async () => {
      mockSessionRepository.findOne.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 3600000),
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockVoterRepository.findOne.mockResolvedValue({ ...mockVoter, isActive: false });

      await expect(service.refreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke specific session when sessionId provided', async () => {
      mockSessionRepository.update.mockResolvedValue({ affected: 1 });

      await service.logout('voter-1', 'session-1');

      expect(mockSessionRepository.update).toHaveBeenCalledWith('session-1', {
        revokedAt: expect.any(Date),
      });
    });

    it('should revoke all user sessions when no sessionId provided', async () => {
      mockSessionRepository.update.mockResolvedValue({ affected: 3 });

      await service.logout('voter-1');

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        { userId: 'voter-1', revokedAt: undefined },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('verifyMfa - MFA Flow', () => {
    const mockVoter = {
      id: 'voter-1',
      nationalId: '12345678',
      passwordHash: 'hashedpassword',
    };

    it('should verify MFA successfully for voter', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockSessionRepository.findOne.mockResolvedValue({ id: 'session-1' });

      const result = await service.verifyMfa({
        userId: 'voter-1',
        mfaType: 'biometric',
        mfaData: { faceTemplate: 'test-token' },
      });

      expect(result.verified).toBe(true);
      expect(result.sessionId).toBe('session-1');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockRoRepository.findOne.mockResolvedValue(null);
      mockAdminRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyMfa({
          userId: 'nonexistent',
          mfaType: 'biometric',
          mfaData: { faceTemplate: 'test' },
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should verify MFA for returning officer', async () => {
      const mockRO = { id: 'ro-1' };
      mockVoterRepository.findOne.mockResolvedValue(null);
      mockRoRepository.findOne.mockResolvedValue(mockRO);
      mockSessionRepository.findOne.mockResolvedValue({ id: 'session-ro' });

      const result = await service.verifyMfa({
        userId: 'ro-1',
        mfaType: 'totp',
        mfaData: { totpCode: '123456' },
      });

      expect(result.verified).toBe(true);
    });

    it('should return empty sessionId when no session exists', async () => {
      mockVoterRepository.findOne.mockResolvedValue(mockVoter);
      mockSessionRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyMfa({
        userId: 'voter-1',
        mfaType: 'biometric',
        mfaData: { faceTemplate: 'test' },
      });

      expect(result.sessionId).toBe('');
    });
  });
});
