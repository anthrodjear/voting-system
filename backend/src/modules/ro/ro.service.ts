import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { Vote } from '../../entities/vote.entity';
import { Candidate } from '../../entities/candidate.entity';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class RoService {
  private readonly logger = new Logger(RoService.name);

  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(ReturningOfficer)
    private roRepository: Repository<ReturningOfficer>,
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(Constituency)
    private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async getDashboardStats(roId: string): Promise<any> {
    // Get RO info to find their assigned county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get county details if assigned
    const county = countyId ? await this.countyRepository.findOne({ where: { id: countyId } }) : null;

    // Get voter stats for RO's county
    const [voterCount, verifiedCount, pendingCount, voteCount] = await Promise.all([
      this.voterRepository.count({ where: { countyId } as any }),
      this.voterRepository.count({ where: { countyId, status: 'verified' } as any }),
      this.voterRepository.count({ where: { countyId, status: 'pending' } as any }),
      this.voteRepository.count({ where: { voter: { countyId } as any } }),
    ]);

    return {
      totalVoters: voterCount,
      verifiedVoters: verifiedCount,
      pendingVoters: pendingCount,
      totalVotes: voteCount,
      assignedCounty: county ? {
        id: county.id,
        name: county.countyName,
        code: county.countyCode,
        region: county.region,
      } : null,
    };
  }

  async getPendingApprovals(roId: string): Promise<any> {
    // Get RO info to find their assigned county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get pending voters and candidates for RO's county
    const [pendingVoters, pendingCandidates] = await Promise.all([
      this.voterRepository.find({
        where: { countyId, status: 'pending_biometrics' } as any,
        select: ['id', 'nationalId', 'firstName', 'lastName', 'email', 'phoneNumber', 'status', 'registeredAt'],
      }),
      this.candidateRepository.find({
        where: { countyId, status: 'draft' } as any,
        select: ['id', 'candidateNumber', 'firstName', 'lastName', 'partyName', 'position', 'submittedAt'],
        relations: ['county', 'constituency', 'ward'],
      }),
    ]);

    return {
      pendingVoters: pendingVoters.map(voter => ({
        id: voter.id,
        nationalId: voter.nationalId,
        firstName: voter.firstName,
        lastName: voter.lastName,
        email: voter.email,
        phoneNumber: voter.phoneNumber,
        status: voter.status,
        registeredAt: voter.registeredAt,
      })),
      pendingCandidates: pendingCandidates.map(candidate => ({
        id: candidate.id,
        candidateNumber: candidate.candidateNumber,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        partyName: candidate.partyName,
        position: candidate.position,
        submittedAt: candidate.submittedAt,
        county: candidate.county ? {
          id: candidate.county.id,
          name: candidate.county.countyName,
          code: candidate.county.countyCode,
        } : null,
        constituency: candidate.constituency ? {
          id: candidate.constituency.id,
          name: candidate.constituency.constituencyName,
        } : null,
        ward: candidate.ward ? {
          id: candidate.ward.id,
          name: candidate.ward.wardName,
        } : null,
      })),
    };
  }

  async getVoters(roId: string): Promise<any> {
    // Get RO info to find their assigned county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get paginated voters for RO's county
    const voters = await this.voterRepository.find({
      where: { countyId } as any,
      select: ['id', 'nationalId', 'firstName', 'lastName', 'countyName', 'constituencyName', 'wardName', 'status', 'registeredAt'],
      order: { registeredAt: 'DESC' },
      take: 50, // Default limit
    });

    return voters.map(voter => ({
      id: voter.id,
      nationalId: voter.nationalId,
      firstName: voter.firstName,
      lastName: voter.lastName,
      countyName: voter.countyName,
      constituencyName: voter.constituencyName,
      wardName: voter.wardName,
      status: voter.status,
      registeredAt: voter.registeredAt,
    }));
  }

  async verifyVoter(voterId: string, roId: string): Promise<any> {
    const voter = await this.voterRepository.findOne({
      where: { id: voterId },
      relations: ['county'],
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Get RO info to ensure they're in the same county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    // Check if RO and voter are in the same county
    if (voter.countyId !== ro.assignedCountyId) {
      throw new Error('Voter is not in your assigned county');
    }

    // Update voter status to verified
    await this.voterRepository.update(voterId, {
      status: 'verified',
      verifiedAt: new Date(),
      nationalIdVerified: true,
    });

    // Log the action
    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'voter_verified',
      resource: 'voter',
      resourceId: voterId,
      newValue: { status: 'verified', verifiedAt: new Date() },
    });

    return { verified: true, voterId };
  }

  async rejectVoter(voterId: string, roId: string): Promise<any> {
    const voter = await this.voterRepository.findOne({
      where: { id: voterId },
      relations: ['county'],
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Get RO info to ensure they're in the same county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    // Check if RO and voter are in the same county
    if (voter.countyId !== ro.assignedCountyId) {
      throw new Error('Voter is not in your assigned county');
    }

    // Update voter status to rejected
    await this.voterRepository.update(voterId, {
      status: 'rejected',
    });

    // Log the action
    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'voter_rejected',
      resource: 'voter',
      resourceId: voterId,
      newValue: { status: 'rejected' },
    });

    return { rejected: true, voterId };
  }

  async getActivity(roId: string): Promise<any[]> {
    // Get RO info to find their assigned county
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get recent activity for RO's county
    const logs = await this.auditLogRepository.find({
      where: {
        resourceId: countyId,
        userRole: 'ro',
      } as any,
      order: { createdAt: 'DESC' },
      take: 20,
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
}
