import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Election } from '../../entities/election.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateCandidateDto, ApproveCandidateDto, CandidateQueryDto } from '../../dto/candidate.dto';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(PresidentialCandidate)
    private presidentialRepository: Repository<PresidentialCandidate>,
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(dto: CreateCandidateDto, userId: string, userRole: string): Promise<{ candidateId: string; status: string; message: string }> {
    // Generate unique candidate number
    const candidateNumber = this.generateCandidateNumber(dto.position);

    // Check for duplicates
    const existing = await this.candidateRepository.findOne({
      where: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        position: dto.position,
      },
    });

    if (existing) {
      throw new ConflictException('Candidate with this name and position already exists');
    }

    // Get current active election
    const election = await this.electionRepository.findOne({
      where: { status: 'voting' },
    });

    // Lookup geographic data
    let countyId: string | undefined;
    let constituencyId: string | undefined;

    if (dto.county) {
      const county = await this.countyRepository.findOne({
        where: { countyName: dto.county },
      });
      if (county) countyId = county.id;
    }

    // Create candidate
    const candidate = await this.candidateRepository.save({
      candidateNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      position: dto.position,
      countyId,
      constituencyId,
      partyName: dto.party,
      partyAbbreviation: dto.partyAbbreviation,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      photo: dto.photo,
      manifesto: dto.manifesto,
      manifestoHighlights: dto.highlights,
      status: 'pending',
      submittedAt: new Date(),
      electionId: election?.id,
    });

    // Audit log
    await this.auditLogRepository.save({
      userId,
      userRole,
      action: 'candidate_created',
      resource: 'candidate',
      resourceId: candidate.id,
      newValue: { ...dto, status: 'pending' },
    });

    return {
      candidateId: candidate.id,
      status: 'pending',
      message: 'Pending approval',
    };
  }

  async findAll(query: CandidateQueryDto): Promise<{ candidates: any[]; pagination: { page: number; limit: number; total: number } }> {
    const { position, county, status, page = 1, limit = 20 } = query;

    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.county', 'county')
      .leftJoinAndSelect('candidate.constituency', 'constituency');

    if (position) {
      queryBuilder.andWhere('candidate.position = :position', { position });
    }

    if (county) {
      queryBuilder.andWhere('county.countyName = :county', { county });
    }

    if (status) {
      queryBuilder.andWhere('candidate.status = :status', { status });
    }

    queryBuilder.andWhere('candidate.status != :excludedStatus', { excludedStatus: 'rejected' });

    const total = await queryBuilder.getCount();
    const candidates = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('candidate.candidateNumber', 'ASC')
      .getMany();

    return {
      candidates: candidates.map((c) => ({
        candidateId: c.id,
        fullName: `${c.firstName} ${c.middleName || ''} ${c.lastName}`.trim(),
        position: c.position,
        party: c.partyName,
        photo: c.photo,
        county: c.county?.countyName || c.countyName,
        status: c.status,
      })),
      pagination: { page, limit, total },
    };
  }

  async findById(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['county', 'constituency', 'election'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async approve(id: string, dto: ApproveCandidateDto, userId: string): Promise<{ candidateId: string; status: string; approvedAt: Date }> {
    const candidate = await this.findById(id);

    if (dto.action === 'approve') {
      await this.candidateRepository.update(id, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: userId,
      });

      await this.auditLogRepository.save({
        userId,
        userRole: 'admin',
        action: 'candidate_approved',
        resource: 'candidate',
        resourceId: id,
        newValue: { status: 'approved' },
      });

      return {
        candidateId: id,
        status: 'approved',
        approvedAt: new Date(),
      };
    } else {
      await this.candidateRepository.update(id, {
        status: 'rejected',
        approvedAt: new Date(),
        approvedBy: userId,
      });

      await this.auditLogRepository.save({
        userId,
        userRole: 'admin',
        action: 'candidate_rejected',
        resource: 'candidate',
        resourceId: id,
        newValue: { status: 'rejected', reason: dto.rejectionReason },
      });

      return {
        candidateId: id,
        status: 'rejected',
        approvedAt: new Date(),
      };
    }
  }

  async getByPosition(position: string, county?: string): Promise<Candidate[]> {
    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.county', 'county')
      .where('candidate.position = :position', { position })
      .andWhere('candidate.status = :status', { status: 'approved' });

    if (county) {
      queryBuilder.andWhere('county.countyName = :county', { county });
    }

    return queryBuilder.orderBy('candidate.candidateNumber', 'ASC').getMany();
  }

  private generateCandidateNumber(position: string): string {
    const prefix = {
      president: 'PRES',
      governor: 'GOV',
      senator: 'SEN',
      mp: 'MP',
      mca: 'MCA',
    }[position] || 'CAN';

    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${random}`;
  }
}
