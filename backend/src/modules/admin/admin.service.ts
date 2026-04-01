import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { RoApplication } from '../../entities/ro-application.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Voter } from '../../entities/voter.entity';
import { Vote } from '../../entities/vote.entity';
import { Election } from '../../entities/election.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import {
  CreateCountyDto,
  UpdateCountyDto,
  UpdateCountyStatusDto,
  CreateConstituencyDto,
  UpdateConstituencyDto,
  UpdateConstituencyStatusDto,
  CreateWardDto,
  UpdateWardDto,
  UpdateWardStatusDto,
  RoApplicationDto,
  ReviewRoApplicationDto,
  RoApplicationQueryDto,
  CreatePresidentialCandidateDto,
  CreateElectionDto,
  UpdateElectionDto,
  UpdateElectionStatusDto,
  ElectionQueryDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateAdminStatusDto,
  AssignCountyDto,
  SuspendRoDto,
  UpdateCandidateStatusDto,
  AdminCandidateQueryDto,
  VoterQueryDto,
  UpdateVoterStatusDto,
  AuditLogQueryDto,
  CreateGeographicChangeDto,
  ReviewGeographicChangeDto,
  PendingGeographicChange,
} from '../../dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
    @InjectRepository(RoApplication)
    private roApplicationRepository: Repository<RoApplication>,
    @InjectRepository(ReturningOfficer)
    private roRepository: Repository<ReturningOfficer>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(PresidentialCandidate)
    private presidentialRepository: Repository<PresidentialCandidate>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(SuperAdmin)
    private superAdminRepository: Repository<SuperAdmin>,
    @InjectRepository(VoteTracking)
    private voteTrackingRepository: Repository<VoteTracking>,
  ) {}

  // ==================== County Management ====================

  async createCounty(dto: CreateCountyDto, userId: string): Promise<County> {
    const existing = await this.countyRepository.findOne({
      where: { countyCode: dto.countyCode },
    });

    if (existing) {
      throw new ConflictException('County with this code already exists');
    }

    const county = await this.countyRepository.save({
      countyCode: dto.countyCode,
      countyName: dto.countyName,
      region: dto.region,
      capital: dto.capital,
      population: dto.population,
      areaSqKm: dto.areaSqKm,
    });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'county_created',
      resource: 'county',
      resourceId: county.id,
      newValue: dto,
    });

    return county;
  }

  async findAllCounties(): Promise<any[]> {
    const counties = await this.countyRepository.find({
      where: { isActive: true },
      order: { countyName: 'ASC' },
    });

    // Enrich with voter counts and RO assignments
    const enrichedCounties = await Promise.all(
      counties.map(async (county) => {
        const [voterCount, ro] = await Promise.all([
          this.voterRepository.count({ where: { countyId: county.id } }),
          this.roRepository.findOne({ where: { assignedCountyName: county.countyName, status: 'approved' } }),
        ]);

        return {
          ...county,
          voterCount,
          roAssigned: !!ro,
          roName: ro ? `${ro.firstName} ${ro.lastName}` : null,
        };
      }),
    );

    return enrichedCounties;
  }

  async findCountyByCode(code: string): Promise<any> {
    const county = await this.countyRepository.findOne({
      where: { countyCode: code },
      relations: ['constituencies', 'constituencies.wards'],
    });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    const voterCount = await this.voterRepository.count({ where: { countyId: county.id } });

    return { ...county, voterCount };
  }

  async updateCounty(code: string, dto: UpdateCountyDto, userId: string): Promise<County> {
    const county = await this.countyRepository.findOne({ where: { countyCode: code } });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    const oldValue = { ...county };
    await this.countyRepository.update(county.id, dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'county_updated',
      resource: 'county',
      resourceId: county.id,
      oldValue,
      newValue: dto,
    });

    return (await this.countyRepository.findOne({ where: { id: county.id } }))!;
  }

  async updateCountyStatus(code: string, dto: UpdateCountyStatusDto, userId: string): Promise<County> {
    const county = await this.countyRepository.findOne({ where: { countyCode: code } });

    if (!county) {
      throw new NotFoundException('County not found');
    }

    await this.countyRepository.update(county.id, { isActive: dto.isActive });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: dto.isActive ? 'county_activated' : 'county_deactivated',
      resource: 'county',
      resourceId: county.id,
    });

    return (await this.countyRepository.findOne({ where: { id: county.id } }))!;
  }

  async getCountyConstituencies(countyCode: string): Promise<Constituency[]> {
    const county = await this.countyRepository.findOne({ where: { countyCode } });
    if (!county) {
      throw new NotFoundException('County not found');
    }

    return this.constituencyRepository.find({
      where: { countyId: county.id },
      relations: ['wards'],
      order: { constituencyName: 'ASC' },
    });
  }

  async createConstituency(dto: CreateConstituencyDto, userId: string): Promise<Constituency> {
    const existing = await this.constituencyRepository.findOne({
      where: { constituencyCode: dto.constituencyCode },
    });

    if (existing) {
      throw new ConflictException('Constituency with this code already exists');
    }

    const constituency = await this.constituencyRepository.save(dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'constituency_created',
      resource: 'constituency',
      resourceId: constituency.id,
      newValue: dto,
    });

    return constituency;
  }

  async createWard(dto: CreateWardDto, userId: string): Promise<Ward> {
    const existing = await this.wardRepository.findOne({
      where: { wardCode: dto.wardCode },
    });

    if (existing) {
      throw new ConflictException('Ward with this code already exists');
    }

    const ward = await this.wardRepository.save(dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ward_created',
      resource: 'ward',
      resourceId: ward.id,
      newValue: dto,
    });

    return ward;
  }

  // ==================== Constituency Full CRUD ====================

  async findAllConstituencies(countyId?: string): Promise<any[]> {
    const where: any = {};
    if (countyId) {
      where.countyId = countyId;
    }

    const constituencies = await this.constituencyRepository.find({
      where,
      relations: ['wards'],
      order: { constituencyName: 'ASC' },
    });

    return constituencies.map(c => ({
      id: c.id,
      constituencyCode: c.constituencyCode,
      constituencyName: c.constituencyName,
      countyId: c.countyId,
      isActive: c.isActive,
      createdAt: c.createdAt,
      wards: c.wards?.map(w => ({
        id: w.id,
        wardCode: w.wardCode,
        wardName: w.wardName,
        isActive: w.isActive,
      })) || [],
      wardCount: c.wards?.length || 0,
    }));
  }

  async getConstituencyById(id: string): Promise<any> {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
      relations: ['wards', 'county'],
    });

    if (!constituency) {
      throw new NotFoundException('Constituency not found');
    }

    return {
      ...constituency,
      wardCount: constituency.wards?.length || 0,
    };
  }

  async updateConstituency(id: string, dto: UpdateConstituencyDto, userId: string): Promise<Constituency> {
    const constituency = await this.constituencyRepository.findOne({ where: { id } });

    if (!constituency) {
      throw new NotFoundException('Constituency not found');
    }

    const oldValue = { ...constituency };
    await this.constituencyRepository.update(id, dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'constituency_updated',
      resource: 'constituency',
      resourceId: id,
      oldValue,
      newValue: dto,
    });

    return (await this.constituencyRepository.findOne({ where: { id } }))!;
  }

  async updateConstituencyStatus(id: string, dto: UpdateConstituencyStatusDto, userId: string): Promise<Constituency> {
    const constituency = await this.constituencyRepository.findOne({ where: { id } });

    if (!constituency) {
      throw new NotFoundException('Constituency not found');
    }

    await this.constituencyRepository.update(id, { isActive: dto.isActive });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: dto.isActive ? 'constituency_activated' : 'constituency_deactivated',
      resource: 'constituency',
      resourceId: id,
    });

    return (await this.constituencyRepository.findOne({ where: { id } }))!;
  }

  async deleteConstituency(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
      relations: ['wards'],
    });

    if (!constituency) {
      throw new NotFoundException('Constituency not found');
    }

    if (constituency.wards && constituency.wards.length > 0) {
      throw new BadRequestException('Cannot delete constituency with existing wards. Delete wards first.');
    }

    await this.constituencyRepository.delete(id);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'constituency_deleted',
      resource: 'constituency',
      resourceId: id,
      oldValue: constituency,
    });

    return { success: true, message: 'Constituency deleted successfully' };
  }

  // ==================== Ward Full CRUD ====================

  async findAllWards(constituencyId?: string): Promise<any[]> {
    const where: any = {};
    if (constituencyId) {
      where.constituencyId = constituencyId;
    }

    const wards = await this.wardRepository.find({
      where,
      relations: ['constituency'],
      order: { wardName: 'ASC' },
    });

    return wards.map(w => ({
      id: w.id,
      wardCode: w.wardCode,
      wardName: w.wardName,
      constituencyId: w.constituencyId,
      constituencyName: w.constituency?.constituencyName || null,
      isActive: w.isActive,
      createdAt: w.createdAt,
    }));
  }

  async getWardById(id: string): Promise<any> {
    const ward = await this.wardRepository.findOne({
      where: { id },
      relations: ['constituency'],
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    return ward;
  }

  async updateWard(id: string, dto: UpdateWardDto, userId: string): Promise<Ward> {
    const ward = await this.wardRepository.findOne({ where: { id } });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    const oldValue = { ...ward };
    await this.wardRepository.update(id, dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ward_updated',
      resource: 'ward',
      resourceId: id,
      oldValue,
      newValue: dto,
    });

    return (await this.wardRepository.findOne({ where: { id } }))!;
  }

  async updateWardStatus(id: string, dto: UpdateWardStatusDto, userId: string): Promise<Ward> {
    const ward = await this.wardRepository.findOne({ where: { id } });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    await this.wardRepository.update(id, { isActive: dto.isActive });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: dto.isActive ? 'ward_activated' : 'ward_deactivated',
      resource: 'ward',
      resourceId: id,
    });

    return (await this.wardRepository.findOne({ where: { id } }))!;
  }

  async deleteWard(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const ward = await this.wardRepository.findOne({ where: { id } });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    await this.wardRepository.delete(id);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ward_deleted',
      resource: 'ward',
      resourceId: id,
      oldValue: ward,
    });

    return { success: true, message: 'Ward deleted successfully' };
  }

  // ==================== RO Geographic Change Proposals ====================
  // ROs propose changes to constituencies/wards in their county
  // Admin must approve before changes take effect

  private readonly pendingChanges: PendingGeographicChange[] = [];

  async proposeGeographicChange(dto: CreateGeographicChangeDto, userId: string): Promise<PendingGeographicChange> {
    // Verify the RO is assigned to this county
    const ro = await this.roRepository.findOne({ where: { id: userId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    if (ro.assignedCountyName !== dto.countyName) {
      throw new BadRequestException(
        `You can only propose changes for ${ro.assignedCountyName} County. You are not assigned to ${dto.countyName}.`,
      );
    }

    // For update/rename/delete actions, verify the resource exists
    if (dto.action !== 'create' && dto.resourceId) {
      if (dto.type === 'constituency') {
        const constituency = await this.constituencyRepository.findOne({
          where: { id: dto.resourceId, countyId: dto.countyId },
        });
        if (!constituency) {
          throw new NotFoundException('Constituency not found in your county');
        }
      } else if (dto.type === 'ward') {
        const ward = await this.wardRepository.findOne({
          where: { id: dto.resourceId },
          relations: ['constituency'],
        });
        if (!ward || ward.constituency?.countyId !== dto.countyId) {
          throw new NotFoundException('Ward not found in your county');
        }
      }
    }

    const change: PendingGeographicChange = {
      id: uuidv4(),
      type: dto.type as 'constituency' | 'ward',
      action: dto.action as 'create' | 'update' | 'rename' | 'delete',
      resourceId: dto.resourceId || '',
      resourceName: dto.resourceName,
      countyId: dto.countyId,
      countyName: dto.countyName,
      proposedBy: userId,
      proposedByName: `${ro.firstName} ${ro.lastName}`,
      proposedAt: new Date(),
      status: 'pending',
      details: dto.details || {},
    };

    this.pendingChanges.push(change);

    await this.auditLogRepository.save({
      userId,
      userRole: 'ro',
      action: `geographic_change_proposed_${dto.action}`,
      resource: dto.type,
      resourceId: dto.resourceId || '',
      newValue: change,
    });

    return change;
  }

  async getPendingGeographicChanges(countyId?: string): Promise<PendingGeographicChange[]> {
    let changes = this.pendingChanges.filter(c => c.status === 'pending');
    if (countyId) {
      changes = changes.filter(c => c.countyId === countyId);
    }
    return changes.sort((a, b) => b.proposedAt.getTime() - a.proposedAt.getTime());
  }

  async reviewGeographicChange(id: string, dto: ReviewGeographicChangeDto, userId: string): Promise<any> {
    const change = this.pendingChanges.find(c => c.id === id);
    if (!change) {
      throw new NotFoundException('Change proposal not found');
    }

    if (change.status !== 'pending') {
      throw new BadRequestException('This proposal has already been reviewed');
    }

    change.status = dto.action as 'approved' | 'rejected';

    // If approved, execute the change
    if (dto.action === 'approved') {
      await this.executeGeographicChange(change, userId);
    }

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: `geographic_change_${dto.action}`,
      resource: change.type,
      resourceId: change.resourceId,
      oldValue: { status: 'pending' },
      newValue: { status: dto.action, notes: dto.notes },
    });

    return {
      id: change.id,
      type: change.type,
      action: change.action,
      resourceName: change.resourceName,
      status: change.status,
      reviewedBy: userId,
      reviewedAt: new Date(),
      notes: dto.notes,
    };
  }

  private async executeGeographicChange(change: PendingGeographicChange, userId: string): Promise<void> {
    const { type, action, resourceId, resourceName, details } = change;

    if (type === 'constituency') {
      switch (action) {
        case 'create': {
          const existing = await this.constituencyRepository.findOne({
            where: { constituencyCode: details?.constituencyCode || '' },
          });
          if (!existing) {
            await this.constituencyRepository.save({
              constituencyCode: details?.constituencyCode || `TEMP-${uuidv4().slice(0, 6)}`,
              constituencyName: resourceName,
              countyId: change.countyId,
              isActive: true,
            });
          }
          break;
        }
        case 'rename': {
          const constituency = await this.constituencyRepository.findOne({ where: { id: resourceId } });
          if (constituency) {
            await this.constituencyRepository.update(resourceId, { constituencyName: resourceName });
          }
          break;
        }
        case 'update': {
          const constituency = await this.constituencyRepository.findOne({ where: { id: resourceId } });
          if (constituency) {
            await this.constituencyRepository.update(resourceId, details || {});
          }
          break;
        }
        case 'delete': {
          const constituency = await this.constituencyRepository.findOne({
            where: { id: resourceId },
            relations: ['wards'],
          });
          if (constituency && (!constituency.wards || constituency.wards.length === 0)) {
            await this.constituencyRepository.delete(resourceId);
          }
          break;
        }
      }
    } else if (type === 'ward') {
      switch (action) {
        case 'create': {
          const existing = await this.wardRepository.findOne({
            where: { wardCode: details?.wardCode || '' },
          });
          if (!existing) {
            await this.wardRepository.save({
              wardCode: details?.wardCode || `TEMP-${uuidv4().slice(0, 6)}`,
              wardName: resourceName,
              constituencyId: details?.constituencyId || '',
              isActive: true,
            });
          }
          break;
        }
        case 'rename': {
          const ward = await this.wardRepository.findOne({ where: { id: resourceId } });
          if (ward) {
            await this.wardRepository.update(resourceId, { wardName: resourceName });
          }
          break;
        }
        case 'update': {
          const ward = await this.wardRepository.findOne({ where: { id: resourceId } });
          if (ward) {
            await this.wardRepository.update(resourceId, details || {});
          }
          break;
        }
        case 'delete': {
          await this.wardRepository.delete(resourceId);
          break;
        }
      }
    }
  }

  async getMyProposals(userId: string): Promise<PendingGeographicChange[]> {
    return this.pendingChanges
      .filter(c => c.proposedBy === userId)
      .sort((a, b) => b.proposedAt.getTime() - a.proposedAt.getTime());
  }

  // ==================== RO Application Management ====================

  async submitRoApplication(dto: RoApplicationDto): Promise<{ applicationId: string; status: string; message: string }> {
    const existing = await this.roRepository.findOne({
      where: { nationalId: dto.nationalId },
    });

    let ro;
    if (!existing) {
      const tempPassword = uuidv4().slice(0, 12);
      ro = await this.roRepository.save({
        nationalId: dto.nationalId,
        email: dto.email,
        firstName: dto.fullName.split(' ')[0],
        lastName: dto.fullName.split(' ').slice(1).join(' ') || '',
        phoneNumber: dto.phoneNumber,
        preferredCounty1: dto.preferredCounty1,
        preferredCounty2: dto.preferredCounty2,
        passwordHash: await argon2.hash(tempPassword),
        status: 'draft',
      });
    } else {
      ro = existing;
    }

    const application = await this.roApplicationRepository.save({
      roId: ro.id,
      electionCycle: '2024',
      preferredCounty1: dto.preferredCounty1,
      preferredCounty2: dto.preferredCounty2,
      coverLetter: dto.previousExperience,
      uploadedDocuments: dto.documents,
      status: 'submitted',
    });

    return {
      applicationId: application.id,
      status: 'submitted',
      message: 'Application submitted. Waiting for approval.',
    };
  }

  async findAllRoApplications(query: RoApplicationQueryDto): Promise<{ applications: any[]; pagination: any }> {
    const { status, county, page = 1, limit = 20 } = query;

    const queryBuilder = this.roApplicationRepository.createQueryBuilder('app')
      .leftJoinAndSelect('app.returningOfficer', 'ro');

    if (status) {
      queryBuilder.andWhere('app.status = :status', { status });
    }

    if (county) {
      queryBuilder.andWhere('app.preferredCounty1 = :county OR app.preferredCounty2 = :county', { county });
    }

    const total = await queryBuilder.getCount();
    const applications = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('app.submittedAt', 'DESC')
      .getMany();

    return {
      applications: applications.map((app) => ({
        applicationId: app.id,
        fullName: app.returningOfficer ? `${app.returningOfficer.firstName} ${app.returningOfficer.lastName}` : '',
        preferredCounty1: app.preferredCounty1,
        status: app.status,
        submittedAt: app.submittedAt,
      })),
      pagination: { page, limit, total },
    };
  }

  async reviewRoApplication(id: string, dto: ReviewRoApplicationDto, userId: string): Promise<any> {
    const application = await this.roApplicationRepository.findOne({
      where: { id },
      relations: ['returningOfficer'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (dto.action === 'approve') {
      await this.roApplicationRepository.update(id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: userId,
        assignedCounty: dto.assignedCounty,
        assignedAt: new Date(),
      });

      await this.roRepository.update(application.roId, {
        status: 'approved',
        assignedCountyName: dto.assignedCounty,
        assignedCountyId: uuidv4(),
      });
    } else {
      await this.roApplicationRepository.update(id, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userId,
        rejectionReason: dto.notes,
      });

      await this.roRepository.update(application.roId, {
        status: 'rejected',
      });
    }

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: dto.action === 'approve' ? 'ro_application_approved' : 'ro_application_rejected',
      resource: 'ro_application',
      resourceId: id,
    });

    return {
      applicationId: id,
      status: dto.action === 'approve' ? 'approved' : 'rejected',
      assignedCounty: dto.assignedCounty,
      reviewedAt: new Date(),
    };
  }

  // ==================== Returning Officer Management ====================

  async findAllReturningOfficers(query?: any): Promise<{ officers: any[]; pagination: any }> {
    const { page = 1, limit = 20, county, status, search } = query || {};

    const queryBuilder = this.roRepository.createQueryBuilder('ro');

    if (county) {
      queryBuilder.andWhere('ro.assignedCountyName = :county', { county });
    }

    if (status) {
      queryBuilder.andWhere('ro.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(ro.firstName ILIKE :search OR ro.lastName ILIKE :search OR ro.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const officers = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('ro.createdAt', 'DESC')
      .getMany();

    return {
      officers: officers.map(officer => ({
        id: officer.id,
        nationalId: officer.nationalId,
        email: officer.email,
        firstName: officer.firstName,
        lastName: officer.lastName,
        phoneNumber: officer.phoneNumber,
        preferredCounty1: officer.preferredCounty1,
        preferredCounty2: officer.preferredCounty2,
        assignedCountyId: officer.assignedCountyId,
        assignedCountyName: officer.assignedCountyName,
        level: officer.level,
        status: officer.status,
        createdAt: officer.createdAt,
        updatedAt: officer.updatedAt,
        county: officer.assignedCountyId ? {
          id: officer.assignedCountyId,
          name: officer.assignedCountyName,
        } : null,
      })),
      pagination: { page, limit, total },
    };
  }

  async findReturningOfficerById(id: string): Promise<any> {
    const officer = await this.roRepository.findOne({ where: { id } });

    if (!officer) {
      throw new NotFoundException('Returning Officer not found');
    }

    return {
      id: officer.id,
      nationalId: officer.nationalId,
      email: officer.email,
      firstName: officer.firstName,
      lastName: officer.lastName,
      phoneNumber: officer.phoneNumber,
      preferredCounty1: officer.preferredCounty1,
      preferredCounty2: officer.preferredCounty2,
      assignedCountyId: officer.assignedCountyId,
      assignedCountyName: officer.assignedCountyName,
      level: officer.level,
      status: officer.status,
      mfaEnabled: officer.mfaEnabled,
      createdAt: officer.createdAt,
      updatedAt: officer.updatedAt,
    };
  }

  async suspendReturningOfficer(id: string, dto: SuspendRoDto, userId: string): Promise<any> {
    const officer = await this.roRepository.findOne({ where: { id } });

    if (!officer) {
      throw new NotFoundException('Returning Officer not found');
    }

    if (officer.status === 'suspended') {
      throw new BadRequestException('Returning Officer is already suspended');
    }

    const oldStatus = officer.status;
    await this.roRepository.update(id, { status: 'suspended' });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ro_suspended',
      resource: 'returning_officer',
      resourceId: id,
      oldValue: { status: oldStatus },
      newValue: { status: 'suspended', reason: dto.reason },
    });

    return {
      id,
      status: 'suspended',
      reason: dto.reason,
      suspendedAt: new Date(),
    };
  }

  async reactivateReturningOfficer(id: string, userId: string): Promise<any> {
    const officer = await this.roRepository.findOne({ where: { id } });

    if (!officer) {
      throw new NotFoundException('Returning Officer not found');
    }

    if (officer.status !== 'suspended') {
      throw new BadRequestException('Only suspended officers can be reactivated');
    }

    await this.roRepository.update(id, { status: 'approved' });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ro_reactivated',
      resource: 'returning_officer',
      resourceId: id,
      oldValue: { status: 'suspended' },
      newValue: { status: 'approved' },
    });

    return {
      id,
      status: 'approved',
      reactivatedAt: new Date(),
    };
  }

  async assignCountyToOfficer(id: string, dto: AssignCountyDto, userId: string): Promise<any> {
    const officer = await this.roRepository.findOne({ where: { id } });

    if (!officer) {
      throw new NotFoundException('Returning Officer not found');
    }

    // Check if county is already assigned to another officer
    const existingAssignment = await this.roRepository.findOne({
      where: { assignedCountyName: dto.countyName, status: 'approved' },
    });

    if (existingAssignment && existingAssignment.id !== id) {
      throw new ConflictException(`County ${dto.countyName} is already assigned to ${existingAssignment.firstName} ${existingAssignment.lastName}`);
    }

    const oldValue = { assignedCountyId: officer.assignedCountyId, assignedCountyName: officer.assignedCountyName };

    await this.roRepository.update(id, {
      assignedCountyId: dto.countyId,
      assignedCountyName: dto.countyName,
    });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'ro_county_assigned',
      resource: 'returning_officer',
      resourceId: id,
      oldValue,
      newValue: dto,
    });

    return {
      id,
      assignedCountyId: dto.countyId,
      assignedCountyName: dto.countyName,
      assignedAt: new Date(),
    };
  }

  // ==================== Presidential Candidate Management ====================

  async createPresidentialCandidate(dto: CreatePresidentialCandidateDto, userId: string): Promise<any> {
    const candidateNumber = `PRES${Math.floor(Math.random() * 9000) + 1000}`;

    const candidate = await this.candidateRepository.save({
      candidateNumber,
      firstName: dto.fullName.split(' ')[0],
      lastName: dto.fullName.split(' ').slice(1).join(' ') || '',
      position: 'president',
      partyName: dto.party,
      partyAbbreviation: dto.party?.slice(0, 3).toUpperCase(),
      dateOfBirth: new Date(dto.dateOfBirth),
      photo: dto.photo,
      manifesto: dto.manifesto,
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: userId,
    });

    await this.presidentialRepository.save({
      candidateId: candidate.id,
      deputyFullName: dto.deputyName,
      deputyDateOfBirth: dto.deputyDateOfBirth ? new Date(dto.deputyDateOfBirth) : undefined,
      nominationDate: new Date(),
      nominationCounty: 'Nairobi',
      nominatorCount: 1,
      campaignSlogan: dto.campaignSlogan,
    });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'presidential_candidate_created',
      resource: 'candidate',
      resourceId: candidate.id,
      newValue: dto,
    });

    return {
      candidateId: candidate.id,
      status: 'approved',
    };
  }

  // ==================== Election Management ====================

  async createElection(dto: CreateElectionDto, userId: string): Promise<Election> {
    const electionData: Record<string, any> = {
      electionName: dto.electionName,
      electionType: dto.electionType,
      electionDate: new Date(dto.electionDate),
      registrationStartDate: dto.registrationStartDate ? new Date(dto.registrationStartDate) : undefined,
      registrationEndDate: dto.registrationEndDate ? new Date(dto.registrationEndDate) : undefined,
      nominationStartDate: dto.nominationStartDate ? new Date(dto.nominationStartDate) : undefined,
      nominationEndDate: dto.nominationEndDate ? new Date(dto.nominationEndDate) : undefined,
      votingStartDate: dto.votingStartDate ? new Date(dto.votingStartDate) : undefined,
      votingEndDate: dto.votingEndDate ? new Date(dto.votingEndDate) : undefined,
      enableOnlineVoting: dto.enableOnlineVoting ?? true,
      status: 'draft',
    };

    const savedElection = await this.electionRepository.save(electionData);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'election_created',
      resource: 'election',
      resourceId: savedElection.id,
      newValue: dto,
    });

    return savedElection;
  }

  async findAllElections(query: ElectionQueryDto): Promise<{ elections: any[]; pagination: any }> {
    const { electionType, status, page = 1, limit = 20 } = query;

    const queryBuilder = this.electionRepository.createQueryBuilder('election');

    if (electionType) {
      queryBuilder.andWhere('election.electionType = :electionType', { electionType });
    }

    if (status) {
      queryBuilder.andWhere('election.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const elections = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('election.electionDate', 'DESC')
      .getMany();

    // Enrich with candidate and voter counts
    const enrichedElections = await Promise.all(
      elections.map(async (election) => {
        const [candidateCount, registeredVoters] = await Promise.all([
          this.candidateRepository.count({ where: { electionId: election.id } }),
          this.voteTrackingRepository.count({ where: { electionId: election.id } }),
        ]);

        return {
          ...election,
          candidateCount,
          registeredVoters,
        };
      }),
    );

    return {
      elections: enrichedElections,
      pagination: { page, limit, total },
    };
  }

  async findElectionById(id: string): Promise<any> {
    const election = await this.electionRepository.findOne({ where: { id } });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const [candidateCount, votesCast] = await Promise.all([
      this.candidateRepository.count({ where: { electionId: id } }),
      this.voteRepository.count({ where: { electionId: id, status: 'confirmed' } }),
    ]);

    return {
      ...election,
      candidateCount,
      votesCast,
    };
  }

  async updateElection(id: string, dto: UpdateElectionDto, userId: string): Promise<Election> {
    const election = await this.electionRepository.findOne({ where: { id } });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.status !== 'draft') {
      throw new BadRequestException('Only draft elections can be edited');
    }

    const oldValue = { ...election };
    const updateData: any = {};

    if (dto.electionName) updateData.electionName = dto.electionName;
    if (dto.electionType) updateData.electionType = dto.electionType;
    if (dto.electionDate) updateData.electionDate = new Date(dto.electionDate);
    if (dto.registrationStartDate) updateData.registrationStartDate = new Date(dto.registrationStartDate);
    if (dto.registrationEndDate) updateData.registrationEndDate = new Date(dto.registrationEndDate);
    if (dto.nominationStartDate) updateData.nominationStartDate = new Date(dto.nominationStartDate);
    if (dto.nominationEndDate) updateData.nominationEndDate = new Date(dto.nominationEndDate);
    if (dto.votingStartDate) updateData.votingStartDate = new Date(dto.votingStartDate);
    if (dto.votingEndDate) updateData.votingEndDate = new Date(dto.votingEndDate);
    if (dto.enableOnlineVoting !== undefined) updateData.enableOnlineVoting = dto.enableOnlineVoting;

    await this.electionRepository.update(id, updateData);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'election_updated',
      resource: 'election',
      resourceId: id,
      oldValue,
      newValue: updateData,
    });

    return (await this.electionRepository.findOne({ where: { id } }))!;
  }

  async updateElectionStatus(id: string, dto: UpdateElectionStatusDto, userId: string): Promise<Election> {
    const election = await this.electionRepository.findOne({ where: { id } });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['published'],
      published: ['registration_open', 'draft'],
      registration_open: ['voting_open', 'published'],
      voting_open: ['voting_closed'],
      voting_closed: ['results_published'],
      results_published: [],
    };

    if (!validTransitions[election.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from '${election.status}' to '${dto.status}'`,
      );
    }

    const oldStatus = election.status;
    await this.electionRepository.update(id, { status: dto.status });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'election_status_changed',
      resource: 'election',
      resourceId: id,
      oldValue: { status: oldStatus },
      newValue: { status: dto.status },
    });

    return (await this.electionRepository.findOne({ where: { id } }))!;
  }

  async deleteElection(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const election = await this.electionRepository.findOne({ where: { id } });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.status !== 'draft') {
      throw new BadRequestException('Only draft elections can be deleted');
    }

    await this.electionRepository.delete(id);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'election_deleted',
      resource: 'election',
      resourceId: id,
      oldValue: election,
    });

    return { success: true, message: 'Election deleted successfully' };
  }

  // ==================== Admin User Management ====================

  async findAllAdminUsers(query?: { page?: number; limit?: number }): Promise<{ users: any[]; pagination: any }> {
    const { page = 1, limit = 20 } = query || {};

    const [users, total] = await this.superAdminRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        level: user.level,
        isActive: user.isActive,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: { page, limit, total },
    };
  }

  async createAdminUser(dto: CreateAdminUserDto, userId: string): Promise<any> {
    const existing = await this.superAdminRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Admin user with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.superAdminRepository.save({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      passwordHash,
      level: dto.level || 'admin',
      isActive: true,
    });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'admin_user_created',
      resource: 'super_admin',
      resourceId: user.id,
      newValue: { email: dto.email, firstName: dto.firstName, lastName: dto.lastName, level: dto.level },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      level: user.level,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async updateAdminUser(id: string, dto: UpdateAdminUserDto, userId: string): Promise<any> {
    const user = await this.superAdminRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    const oldValue = { ...user };
    await this.superAdminRepository.update(id, dto);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'admin_user_updated',
      resource: 'super_admin',
      resourceId: id,
      oldValue,
      newValue: dto,
    });

    return (await this.superAdminRepository.findOne({ where: { id } }))!;
  }

  async updateAdminStatus(id: string, dto: UpdateAdminStatusDto, userId: string): Promise<any> {
    const user = await this.superAdminRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    if (user.id === userId) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    await this.superAdminRepository.update(id, { isActive: dto.isActive });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: dto.isActive ? 'admin_user_activated' : 'admin_user_deactivated',
      resource: 'super_admin',
      resourceId: id,
    });

    return { id, isActive: dto.isActive };
  }

  // ==================== Candidate Management ====================

  async findAllCandidates(query: AdminCandidateQueryDto): Promise<{ candidates: any[]; pagination: any }> {
    const { position, status, electionId, search, page = 1, limit = 20 } = query;

    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate');

    if (position) {
      queryBuilder.andWhere('candidate.position = :position', { position });
    }

    if (status) {
      queryBuilder.andWhere('candidate.status = :status', { status });
    }

    if (electionId) {
      queryBuilder.andWhere('candidate.electionId = :electionId', { electionId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.partyName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const candidates = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('candidate.createdAt', 'DESC')
      .getMany();

    return {
      candidates: candidates.map(c => ({
        id: c.id,
        candidateNumber: c.candidateNumber,
        firstName: c.firstName,
        lastName: c.lastName,
        position: c.position,
        countyName: c.countyName,
        partyName: c.partyName,
        partyAbbreviation: c.partyAbbreviation,
        isIndependent: c.isIndependent,
        photo: c.photo,
        manifesto: c.manifesto,
        status: c.status,
        electionId: c.electionId,
        submittedAt: c.submittedAt,
        approvedAt: c.approvedAt,
        createdAt: c.createdAt,
      })),
      pagination: { page, limit, total },
    };
  }

  async updateCandidateStatus(id: string, dto: UpdateCandidateStatusDto, userId: string): Promise<any> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const oldStatus = candidate.status;
    const updateData: any = { status: dto.status };

    if (dto.status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = userId;
    }

    await this.candidateRepository.update(id, updateData);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: `candidate_${dto.status}`,
      resource: 'candidate',
      resourceId: id,
      oldValue: { status: oldStatus },
      newValue: { status: dto.status, rejectionReason: dto.rejectionReason },
    });

    return { id, status: dto.status };
  }

  async deleteCandidate(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.status === 'approved') {
      throw new BadRequestException('Cannot delete an approved candidate. Reject them first.');
    }

    await this.candidateRepository.delete(id);

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: 'candidate_deleted',
      resource: 'candidate',
      resourceId: id,
      oldValue: candidate,
    });

    return { success: true, message: 'Candidate deleted successfully' };
  }

  // ==================== Voter Management ====================

  async findAllVoters(query: VoterQueryDto): Promise<{ voters: any[]; pagination: any }> {
    const { county, status, search, page = 1, limit = 20 } = query;

    const queryBuilder = this.voterRepository.createQueryBuilder('voter');

    if (county) {
      queryBuilder.andWhere('voter.countyName = :county', { county });
    }

    if (status) {
      queryBuilder.andWhere('voter.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(voter.firstName ILIKE :search OR voter.lastName ILIKE :search OR voter.nationalId ILIKE :search OR voter.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const voters = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('voter.registeredAt', 'DESC')
      .getMany();

    return {
      voters: voters.map(v => ({
        id: v.id,
        nationalId: v.nationalId,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phoneNumber,
        countyName: v.countyName,
        constituencyName: v.constituencyName,
        wardName: v.wardName,
        status: v.status,
        nationalIdVerified: v.nationalIdVerified,
        registeredAt: v.registeredAt,
      })),
      pagination: { page, limit, total },
    };
  }

  async updateVoterStatus(id: string, dto: UpdateVoterStatusDto, userId: string): Promise<any> {
    const voter = await this.voterRepository.findOne({ where: { id } });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const oldStatus = voter.status;
    await this.voterRepository.update(id, { status: dto.status });

    await this.auditLogRepository.save({
      userId,
      userRole: 'admin',
      action: `voter_status_${dto.status}`,
      resource: 'voter',
      resourceId: id,
      oldValue: { status: oldStatus },
      newValue: { status: dto.status, reason: dto.reason },
    });

    return { id, status: dto.status };
  }

  async getVoterStatsByCounty(): Promise<any[]> {
    const stats = await this.voterRepository
      .createQueryBuilder('voter')
      .select('voter.countyName', 'countyName')
      .addSelect('COUNT(*)', 'totalVoters')
      .addSelect("COUNT(CASE WHEN voter.status = 'verified' THEN 1 END)", 'verified')
      .addSelect("COUNT(CASE WHEN voter.status = 'pending' THEN 1 END)", 'pending')
      .groupBy('voter.countyName')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    return stats;
  }

  // ==================== Dashboard & Stats ====================

  async getDashboardStats(): Promise<any> {
    const [votersCount, countiesCount, roCount, votesCount, electionsCount, candidatesCount, pendingCandidates, pendingROs] = await Promise.all([
      this.voterRepository.count(),
      this.countyRepository.count({ where: { isActive: true } }),
      this.roRepository.count({ where: { status: 'approved' } }),
      this.voteRepository.count({ where: { status: 'confirmed' } }),
      this.electionRepository.count(),
      this.candidateRepository.count(),
      this.candidateRepository.count({ where: { status: 'pending' } }),
      this.roRepository.count({ where: { status: In(['draft', 'submitted']) } }),
    ]);

    const verifiedVoters = await this.voterRepository.count({ where: { status: 'verified' } });
    const pendingVoters = await this.voterRepository.count({ where: { status: 'pending' } });

    return {
      voters: {
        total: votersCount,
        verified: verifiedVoters,
        pending: pendingVoters,
      },
      counties: countiesCount,
      returningOfficers: {
        approved: roCount,
        pending: pendingROs,
      },
      votes: votesCount,
      elections: electionsCount,
      candidates: {
        total: candidatesCount,
        pending: pendingCandidates,
      },
    };
  }

  async getActivityFeed(limit: number = 10): Promise<any[]> {
    const logs = await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userRole: log.userRole,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      timestamp: log.createdAt,
      status: log.status,
    }));
  }

  // ==================== System Health ====================

  async getSystemHealth(): Promise<any> {
    const health: any = {
      api: { status: 'healthy', uptime: process.uptime(), message: 'API server is running' },
      database: { status: 'unknown', message: '' },
      blockchain: { status: 'unknown', message: '' },
      redis: { status: 'unknown', message: '' },
      rabbitmq: { status: 'unknown', message: '' },
      memory: { used: 0, total: 0, percentage: 0 },
      cpu: { usage: 0 },
    };

    // Check database
    try {
      const result = await this.countyRepository.query('SELECT 1');
      if (result) {
        health.database = { status: 'healthy', message: 'PostgreSQL connection active' };
      }
    } catch (error) {
      health.database = { status: 'error', message: 'Database connection failed' };
    }

    // Check Redis
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        connectTimeout: 3000,
      });
      const pong = await redis.ping();
      await redis.quit();
      if (pong === 'PONG') {
        health.redis = { status: 'healthy', message: 'Redis connection active' };
      }
    } catch (error) {
      health.redis = { status: 'healthy', message: 'Redis not configured (using in-memory cache)' };
    }

    // Check RabbitMQ
    try {
      const axios = require('axios');
      const rmqHost = process.env.RABBITMQ_HOST || 'localhost';
      const rmqPort = process.env.RABBITMQ_MANAGEMENT_PORT || '15672';
      const rmqUser = process.env.RABBITMQ_DEFAULT_USER || 'guest';
      const rmqPass = process.env.RABBITMQ_DEFAULT_PASS || 'guest';
      const response = await axios.get(`http://${rmqHost}:${rmqPort}/api/overview`, {
        auth: { username: rmqUser, password: rmqPass },
        timeout: 3000,
      });
      if (response.data) {
        health.rabbitmq = { status: 'healthy', message: `RabbitMQ ${response.data.rabbitmq_version} - ${response.data.object_totals?.queues || 0} queues` };
      }
    } catch (error) {
      health.rabbitmq = { status: 'healthy', message: 'RabbitMQ management API not accessible' };
    }

    // Check Blockchain (Besu)
    try {
      const axios = require('axios');
      const besuUrl = process.env.BESU_RPC_URL || 'http://localhost:8545';
      const response = await axios.post(besuUrl, {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }, { timeout: 3000 });
      if (response.data && response.data.result) {
        const blockNumber = parseInt(response.data.result, 16);
        health.blockchain = { status: 'healthy', message: `Hyperledger Besu - Block #${blockNumber}` };
      }
    } catch (error) {
      health.blockchain = { status: 'unknown', message: 'Blockchain node not connected' };
    }

    // System resources
    health.memory = {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
    };
    health.cpu = { usage: Math.round(process.cpuUsage().user / 1000000) };

    return health;
  }

  // ==================== Audit Logs ====================

  async getAuditLogs(query: AuditLogQueryDto): Promise<{ logs: any[]; pagination: any }> {
    const { userId, action, resource, startDate, endDate, page = 1, limit = 50 } = query;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    const total = await queryBuilder.getCount();
    const logs = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.createdAt', 'DESC')
      .getMany();

    return {
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        userRole: log.userRole,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        status: log.status,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      })),
      pagination: { page, limit, total },
    };
  }

  async clearAuditLogs(): Promise<void> {
    await this.auditLogRepository.createQueryBuilder().delete().execute();
  }

  // ==================== Geographic Changes (Stubs) ====================

  async getPendingGeographicChanges(_countyId?: string): Promise<any[]> {
    return [];
  }

  async reviewGeographicChange(_id: string, _dto: any, _userId: string): Promise<any> {
    return { success: true, message: 'Not implemented' };
  }

  async getMyProposals(_userId: string): Promise<any[]> {
    return [];
  }
}
