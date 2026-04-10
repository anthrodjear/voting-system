import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { Session } from '../../entities/session.entity';
import { LoginHistory } from '../../entities/login-history.entity';
import { LoginDto, MfaVerifyDto } from '../../dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  userType: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requiresMfa: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(ReturningOfficer)
    private roRepository: Repository<ReturningOfficer>,
    @InjectRepository(SuperAdmin)
    private adminRepository: Repository<SuperAdmin>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const { identifier, password, userType } = dto;

    let user: Voter | ReturningOfficer | SuperAdmin | null = null;
    let resolvedUserType = userType || 'voter';

    if (!userType || userType === 'voter') {
      user = await this.voterRepository.findOne({
        where: [{ nationalId: identifier }, { email: identifier }],
      });
      if (user) resolvedUserType = 'voter';
    }

    if (!user && (!userType || userType === 'ro')) {
      user = await this.roRepository.findOne({ where: { email: identifier } });
      if (user) resolvedUserType = 'ro';
    }

    if (!user && (!userType || userType === 'admin')) {
      user = await this.adminRepository.findOne({ where: { email: identifier } });
      if (user) resolvedUserType = 'admin';
    }

    if (!user) {
      await this.logLoginAttempt(identifier, resolvedUserType, false, 'User not found', ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    
    if (!isPasswordValid) {
      await this.logLoginAttempt(user.id, resolvedUserType, false, 'Invalid password', ipAddress, userAgent);
      
      // Increment failed attempts
      if (resolvedUserType === 'voter') {
        await this.voterRepository.update(user.id, {
          failedLoginAttempts: (user as Voter).failedLoginAttempts + 1,
        });
      }
      
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if ((user as any).isActive === false) {
      await this.logLoginAttempt(user.id, resolvedUserType, false, 'Account deactivated', ipAddress, userAgent);
      throw new UnauthorizedException('Account is deactivated');
    }

    await this.logLoginAttempt(user.id, resolvedUserType, true, undefined, ipAddress, userAgent);

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: (user as any).email || (user as any).nationalId,
      role: resolvedUserType === 'admin' ? 'super_admin' : resolvedUserType,
      userType: resolvedUserType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    // Save session
    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN_MS', 900000);
    await this.sessionRepository.save({
      userId: user.id,
      userType: resolvedUserType,
      tokenHash: await argon2.hash(accessToken),
      refreshTokenHash: await argon2.hash(refreshToken),
      expiresAt: new Date(Date.now() + expiresIn),
    });

    // Check if MFA is enabled
    const mfaEnabled = (user as any).mfaEnabled || false;

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(expiresIn / 1000),
      requiresMfa: mfaEnabled,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: await argon2.hash(refreshToken) },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userType = session.userType;
    let user: Voter | ReturningOfficer | SuperAdmin | null = null;

    if (userType === 'voter') {
      user = await this.voterRepository.findOne({ where: { id: session.userId } });
    } else if (userType === 'ro') {
      user = await this.roRepository.findOne({ where: { id: session.userId } });
    } else {
      user = await this.adminRepository.findOne({ where: { id: session.userId } });
    }

    if (!user || (user as any).isActive === false) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: (user as any).email || (user as any).nationalId,
      role: userType === 'admin' ? 'super_admin' : userType,
      userType,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN_MS', 900000);

    // Update session
    await this.sessionRepository.update(session.id, {
      tokenHash: await argon2.hash(accessToken),
    });

    return {
      accessToken,
      expiresIn: Math.floor(expiresIn / 1000),
    };
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.sessionRepository.update(sessionId, { revokedAt: new Date() });
    } else {
      await this.sessionRepository.update(
        { userId, revokedAt: undefined },
        { revokedAt: new Date() },
      );
    }
  }

  async verifyMfa(dto: MfaVerifyDto): Promise<{ verified: boolean; sessionId: string }> {
    // Simplified MFA verification
    // In production, implement proper biometric/TOTP verification
    const { userId, mfaType, mfaData } = dto;

    let user: Voter | ReturningOfficer | SuperAdmin | null = null;

    // Find user
    user = await this.voterRepository.findOne({ where: { id: userId } });
    if (!user) {
      user = await this.roRepository.findOne({ where: { id: userId } });
    }
    if (!user) {
      user = await this.adminRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // For now, accept any MFA data for demonstration
    // In production, verify biometric templates or TOTP code
    const verified = true;

    if (!verified) {
      throw new UnauthorizedException('MFA verification failed');
    }

    // Find active session
    const session = await this.sessionRepository.findOne({
      where: { userId, revokedAt: undefined },
      order: { createdAt: 'DESC' },
    });

    return {
      verified,
      sessionId: session?.id || '',
    };
  }

  async getUserById(userId: string, userType: string): Promise<any> {
    let user: any = null;

    if (userType === 'voter') {
      user = await this.voterRepository.findOne({ where: { id: userId } });
    } else if (userType === 'ro') {
      user = await this.roRepository.findOne({ where: { id: userId } });
    } else {
      user = await this.adminRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  private async logLoginAttempt(
    userId: string,
    userType: string,
    success: boolean,
    failureReason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.loginHistoryRepository.save({
      userId,
      userType,
      success,
      failureReason,
      ipAddress,
      userAgent,
    });
  }

  // ============================================================
  // Password & Profile Management
  // ============================================================

  async changePassword(userId: string, userType: string, currentPassword: string, newPassword: string): Promise<void> {
    let user: Voter | ReturningOfficer | SuperAdmin | null = null;

    if (userType === 'voter') {
      user = await this.voterRepository.findOne({ where: { id: userId } });
    } else if (userType === 'ro') {
      user = await this.roRepository.findOne({ where: { id: userId } });
    } else {
      user = await this.adminRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await argon2.hash(newPassword);

    if (userType === 'voter') {
      await this.voterRepository.update(userId, { passwordHash: newHash, passwordChangedAt: new Date() });
    } else if (userType === 'ro') {
      await this.roRepository.update(userId, { passwordHash: newHash });
    } else {
      await this.adminRepository.update(userId, { passwordHash: newHash });
    }

    this.logger.log(`Password changed for user ${userId}`);
  }

  async forgotPassword(email: string): Promise<void> {
    // Find user across all user types
    let user: Voter | ReturningOfficer | SuperAdmin | null = null;
    let userType = '';

    user = await this.voterRepository.findOne({ where: { email } });
    if (user) userType = 'voter';

    if (!user) {
      user = await this.roRepository.findOne({ where: { email } });
      if (user) userType = 'ro';
    }

    if (!user) {
      user = await this.adminRepository.findOne({ where: { email } });
      if (user) userType = 'admin';
    }

    if (!user) {
      // Don't reveal whether user exists - return success anyway for security
      this.logger.warn(`Forgot password requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = await argon2.hash(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // TODO: Store reset token in database and send email
    // For now, log the token (in production, use a proper email service)
    this.logger.log(`Password reset token for ${email}: ${resetToken} (TODO: integrate email service)`);

    // Store token hash on user record
    // TODO: Add resetTokenHash and resetTokenExpiry columns to user entities
    // For now, this is a stub that would need entity updates
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Implement proper token validation against stored reset tokens
    // For now, this is a stub - in production, verify token hash and expiry
    this.logger.warn(`resetPassword called - TODO: implement token validation`);
    throw new UnauthorizedException('Password reset not yet implemented. Please contact support.');
  }

  async verifyEmail(token: string): Promise<void> {
    // TODO: Implement proper email verification token validation
    // For now, this is a stub
    this.logger.warn(`verifyEmail called - TODO: implement token validation`);
    throw new UnauthorizedException('Email verification not yet implemented. Please contact support.');
  }

  async resendVerification(email: string): Promise<void> {
    // Find user
    let user: Voter | ReturningOfficer | SuperAdmin | null = null;

    user = await this.voterRepository.findOne({ where: { email } });
    if (!user) {
      user = await this.roRepository.findOne({ where: { email } });
    }
    if (!user) {
      user = await this.adminRepository.findOne({ where: { email } });
    }

    if (!user) {
      this.logger.warn(`Resend verification requested for non-existent email: ${email}`);
      return;
    }

    // TODO: Generate and send new verification email
    this.logger.log(`Resend verification for ${email} (TODO: integrate email service)`);
  }

  async updateProfile(userId: string, userType: string, dto: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }): Promise<any> {
    let user: any = null;

    if (userType === 'voter') {
      user = await this.voterRepository.findOne({ where: { id: userId } });
    } else if (userType === 'ro') {
      user = await this.roRepository.findOne({ where: { id: userId } });
    } else {
      user = await this.adminRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: Partial<Voter> = {};
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.phoneNumber) updateData.phoneNumber = dto.phoneNumber;
    if (dto.email) updateData.email = dto.email;

    if (userType === 'voter') {
      await this.voterRepository.update(userId, updateData);
      user = await this.voterRepository.findOne({ where: { id: userId } });
    } else if (userType === 'ro') {
      await this.roRepository.update(userId, updateData);
      user = await this.roRepository.findOne({ where: { id: userId } });
    } else {
      await this.adminRepository.update(userId, updateData);
      user = await this.adminRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found after update');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
