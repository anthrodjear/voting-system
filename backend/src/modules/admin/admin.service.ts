import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import {
  CreateCountyDto,
  RoApplicationDto,
  ReviewRoApplicationDto,
  RoApplicationQueryDto,
  CreatePresidentialCandidateDto,
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
  ) {}

  // County Management
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

  async findAllCounties(): Promise<County[]> {
    return this.countyRepository.find({ where: { isActive: true } });
  }

  // RO Application Management
  async submitRoApplication(dto: RoApplicationDto): Promise<{ applicationId: string; status: string; message: string }> {
    // Check if RO already exists
    const existing = await this.roRepository.findOne({
      where: { nationalId: dto.nationalId },
    });

    let ro;
    if (!existing) {
      // Create new RO
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

    // Create application
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

      // Update RO
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
    }

    return {
      applicationId: id,
      status: dto.action === 'approve' ? 'approved' : 'rejected',
      assignedCounty: dto.assignedCounty,
      reviewedAt: new Date(),
    };
  }

    // Presidential Candidate Management
    async createPresidentialCandidate(dto: CreatePresidentialCandidateDto, userId: string): Promise<any> {
        // First create the base candidate
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

        // Create presidential candidate record
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

    async getDashboardStats(): Promise<any> {
        const [votersCount, countiesCount, roCount, votesCount] = await Promise.all([
            this.voterRepository.count(),
            this.countyRepository.count({ where: { isActive: true } }),
            this.roRepository.count({ where: { status: 'approved' } }),
            this.voteRepository.count({ where: { status: 'confirmed' } }),
        ]);

        return {
            voters: votersCount,
            counties: countiesCount,
            returningOfficers: roCount,
            votes: votesCount,
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

    async findAllReturningOfficers(query?: any): Promise<{ officers: any[]; pagination: any }> {
        const { page = 1, limit = 20, county, status } = query || {};

        const queryBuilder = this.roRepository.createQueryBuilder('ro');

        if (county) {
            queryBuilder.andWhere('ro.assignedCountyName = :county', { county });
        }

        if (status) {
            queryBuilder.andWhere('ro.status = :status', { status });
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
}
