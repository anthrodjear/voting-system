import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(ReturningOfficer)
    private roRepository: Repository<ReturningOfficer>,
    @InjectRepository(SuperAdmin)
    private adminRepository: Repository<SuperAdmin>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || (() => { throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.'); })(),
    });
  }

  async validate(payload: JwtPayload) {
    let user: Voter | ReturningOfficer | SuperAdmin | null = null;

    if (payload.userType === 'voter') {
      user = await this.voterRepository.findOne({ where: { id: payload.sub } });
    } else if (payload.userType === 'ro') {
      user = await this.roRepository.findOne({ where: { id: payload.sub } });
    } else if (payload.userType === 'admin') {
      user = await this.adminRepository.findOne({ where: { id: payload.sub } });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Map to a unified user object
    return {
      id: user.id,
      email: (user as any).email || (user as any).nationalId,
      role: payload.role,
      userType: payload.userType,
      mfaEnabled: (user as any).mfaEnabled || false,
      mfaVerified: false, // Will be set by MfaGuard
      isActive: (user as any).isActive !== false,
    };
  }
}
