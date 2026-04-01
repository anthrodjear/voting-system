import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { Voter } from '../../entities/voter.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { RegisterVoterDto, UpdateVoterDto, BiometricEnrollDto } from '../../dto/voter.dto';

@Injectable()
export class VoterService {
  private readonly logger = new Logger(VoterService.name);

  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(VoterBiometric)
    private biometricRepository: Repository<VoterBiometric>,
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async register(dto: RegisterVoterDto, userId?: string): Promise<{ voterId: string; status: string; message: string }> {
    // Check if voter already exists
    const existingVoter = await this.voterRepository.findOne({
      where: { nationalId: dto.nationalId },
    });

    if (existingVoter) {
      throw new ConflictException('Voter with this National ID already exists');
    }

    // Lookup geographic data
    let countyId: string | undefined;
    let countyName: string | undefined;
    let constituencyId: string | undefined;
    let constituencyName: string | undefined;
    let wardId: string | undefined;
    let wardName: string | undefined;

    if (dto.county) {
      const county = await this.countyRepository.findOne({
        where: { countyName: dto.county },
      });
      if (county) {
        countyId = county.id;
        countyName = county.countyName;
      }
    }

    if (dto.constituency && countyId) {
      const constituency = await this.constituencyRepository.findOne({
        where: { constituencyName: dto.constituency, countyId },
      });
      if (constituency) {
        constituencyId = constituency.id;
        constituencyName = constituency.constituencyName;
      }
    }

    if (dto.ward && constituencyId) {
      const ward = await this.wardRepository.findOne({
        where: { wardName: dto.ward, constituencyId },
      });
      if (ward) {
        wardId = ward.id;
        wardName = ward.wardName;
      }
    }

    // Generate temporary password (should be changed by user)
    const tempPassword = uuidv4().slice(0, 12);
    const passwordHash = await argon2.hash(tempPassword);

    // Create voter
    const voter = await this.voterRepository.save({
      nationalId: dto.nationalId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      countyId,
      countyName,
      constituencyId,
      constituencyName,
      wardId,
      wardName,
      status: 'pending_biometrics',
      passwordHash,
      registeredAt: new Date(),
    });

    // Create biometric record
    await this.biometricRepository.save({
      voterId: voter.id,
    });

    // Audit log
    await this.auditLogRepository.save({
      userId: userId || 'system',
      userRole: 'system',
      action: 'voter_registered',
      resource: 'voter',
      resourceId: voter.id,
      newValue: { nationalId: dto.nationalId, status: 'pending_biometrics' },
    });

    this.logger.log(`Voter registered: ${voter.id}`);

    return {
      voterId: voter.id,
      status: 'pending_biometrics',
      message: 'Please complete biometric enrollment',
    };
  }

  async findById(id: string): Promise<Voter> {
    const voter = await this.voterRepository.findOne({
      where: { id },
      relations: ['biometric'],
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async findByNationalId(nationalId: string): Promise<Voter> {
    const voter = await this.voterRepository.findOne({
      where: { nationalId },
      relations: ['biometric'],
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async update(id: string, dto: UpdateVoterDto, userId: string): Promise<{ voterId: string; updated: boolean }> {
    const voter = await this.findById(id);

    const updateData: Partial<Voter> = {};
    if (dto.phoneNumber) updateData.phoneNumber = dto.phoneNumber;
    if (dto.email) updateData.email = dto.email;

    await this.voterRepository.update(id, updateData);

    // Audit log
    await this.auditLogRepository.save({
      userId,
      userRole: 'voter',
      action: 'voter_updated',
      resource: 'voter',
      resourceId: id,
      newValue: dto,
    });

    return {
      voterId: id,
      updated: true,
    };
  }

  async enrollBiometrics(id: string, dto: BiometricEnrollDto): Promise<{ enrolled: boolean; faceEnrolled: boolean; fingerprintEnrolled: boolean }> {
    const voter = await this.findById(id);

    // Simplified biometric processing
    // In production, integrate with actual biometric SDK
    const faceEnrolled = !!(dto.faceImage && dto.faceLivenessToken);
    const fingerprintEnrolled = !!(dto.fingerprintImages?.leftThumb && dto.fingerprintImages?.rightThumb);

    const biometricId = voter.biometric?.id;
    if (!biometricId) {
      throw new NotFoundException('Biometric record not found');
    }

    await this.biometricRepository.update(biometricId, {
      faceTemplate: faceEnrolled ? dto.faceImage : undefined,
      faceEnrolled: faceEnrolled as boolean,
      faceEnrolledAt: faceEnrolled ? new Date() : undefined,
      faceQualityScore: faceEnrolled ? 0.85 : undefined,
      leftThumbTemplate: fingerprintEnrolled ? dto.fingerprintImages.leftThumb : undefined,
      rightThumbTemplate: fingerprintEnrolled ? dto.fingerprintImages.rightThumb : undefined,
      fingerprintEnrolled: fingerprintEnrolled as boolean,
      fingerprintEnrolledAt: fingerprintEnrolled ? new Date() : undefined,
      fingerprintQualityScore: fingerprintEnrolled ? 0.9 : undefined,
      livenessChallenge: dto.faceLivenessToken,
      livenessGeneratedAt: new Date(),
    });

    // Update voter status if both biometrics enrolled
    if (faceEnrolled && fingerprintEnrolled) {
      await this.voterRepository.update(id, {
        status: 'verified',
        nationalIdVerified: true,
        verifiedAt: new Date(),
      });
    }

    return {
      enrolled: faceEnrolled && fingerprintEnrolled,
      faceEnrolled,
      fingerprintEnrolled,
    };
  }

  async getStats(county?: string): Promise<{ total: number; registered: number; verified: number; pending: number; byCounty: any[] }> {
    const baseWhere = county ? { countyName: county } : {};

    const total = await this.voterRepository.count({ where: baseWhere });
    const registered = await this.voterRepository.count({ where: { ...baseWhere, status: 'registered' } as any });
    const verified = await this.voterRepository.count({ where: { ...baseWhere, status: 'verified' } as any });
    const pending = await this.voterRepository.count({ where: { ...baseWhere, status: 'pending' } as any });

    const byCounty = await this.voterRepository
      .createQueryBuilder('voter')
      .select('voter.county_name', 'county')
      .addSelect('COUNT(*)', 'count')
      .groupBy('voter.county_name')
      .getRawMany();

    return {
      total,
      registered,
      verified,
      pending,
      byCounty,
    };
  }

  async getStatus(id: string): Promise<{ voterId: string; status: string; idVerified: boolean; faceEnrolled: boolean; fingerprintEnrolled: boolean; verifiedAt?: Date }> {
    const voter = await this.findById(id);

    return {
      voterId: voter.id,
      status: voter.status,
      idVerified: voter.nationalIdVerified,
      faceEnrolled: voter.biometric?.faceEnrolled || false,
      fingerprintEnrolled: voter.biometric?.fingerprintEnrolled || false,
      verifiedAt: voter.verifiedAt,
    };
  }
}
