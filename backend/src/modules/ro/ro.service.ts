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
import { Batch } from '../../entities/batch.entity';
import { Election } from '../../entities/election.entity';
import { NotificationService } from '../notification/notification.service';

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
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    private notificationService: NotificationService,
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
      registrationStatus: 'verified',
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

    // Notify the voter that their registration was verified
    await this.notificationService.create({
      userId: voterId,
      userRole: 'voter',
      type: 'success',
      title: 'Registration Verified',
      message: `Your voter registration has been verified by the Returning Officer for ${ro.assignedCountyId ? 'your county' : 'the county'}. You are now eligible to vote.`,
      actionUrl: '/voter/dashboard',
      icon: 'check',
      relatedResource: 'voter',
      relatedResourceId: voterId,
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
      registrationStatus: 'rejected',
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

    // Notify the voter that their registration was rejected
    await this.notificationService.create({
      userId: voterId,
      userRole: 'voter',
      type: 'error',
      title: 'Registration Rejected',
      message: `Your voter registration has been rejected by the Returning Officer. Please contact your county election office for more details.`,
      actionUrl: '/voter/dashboard',
      icon: 'alert',
      relatedResource: 'voter',
      relatedResourceId: voterId,
    });

    return { rejected: true, voterId };
  }

  async getCandidates(roId: string): Promise<any[]> {
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    const candidates = await this.candidateRepository.find({
      where: { countyId } as any,
      select: ['id', 'candidateNumber', 'firstName', 'lastName', 'partyName', 'partyAbbreviation', 'position', 'status', 'submittedAt', 'approvedAt'],
      order: { submittedAt: 'DESC' },
      take: 50,
    });

    return candidates.map(candidate => ({
      id: candidate.id,
      candidateNumber: candidate.candidateNumber,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      partyName: candidate.partyName,
      partyAbbreviation: candidate.partyAbbreviation,
      position: candidate.position,
      status: candidate.status,
      submittedAt: candidate.submittedAt,
      approvedAt: candidate.approvedAt,
    }));
  }

  async createCandidate(roId: string, data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    position: string;
    partyName: string;
    partyAbbreviation?: string;
    isIndependent?: boolean;
    constituencyId?: string;
    wardId?: string;
  }): Promise<any> {
    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;
    const county = countyId ? await this.countyRepository.findOne({ where: { id: countyId } }) : null;

    // Generate a unique candidate number
    const candidateNumber = `C${Date.now().toString().slice(-8)}`;

    // Look up constituency/ward names if IDs provided
    let constituencyId: string | undefined;
    let wardId: string | undefined;

    if (data.constituencyId) {
      const constituency = await this.constituencyRepository.findOne({ where: { id: data.constituencyId } });
      if (constituency) constituencyId = constituency.id;
    }

    if (data.wardId) {
      const ward = await this.wardRepository.findOne({ where: { id: data.wardId } });
      if (ward) wardId = ward.id;
    }

    const candidate = this.candidateRepository.create({
      candidateNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      position: data.position,
      countyId,
      countyName: county?.countyName,
      constituencyId,
      wardId,
      partyName: data.partyName,
      partyAbbreviation: data.partyAbbreviation,
      isIndependent: data.isIndependent || false,
      status: 'pending',
      submittedAt: new Date(),
    });

    const saved = await this.candidateRepository.save(candidate);

    // Log the action
    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'candidate_created',
      resource: 'candidate',
      resourceId: saved.id,
      newValue: { status: 'pending', position: data.position, name: `${data.firstName} ${data.lastName}` },
    });

    // Notify admin that a new candidate needs approval
    await this.notificationService.createForRole({
      userRole: 'admin',
      type: 'warning',
      title: 'New Candidate Pending Approval',
      message: `${data.firstName} ${data.lastName} has been submitted for ${data.position} in ${county?.countyName || 'the county'} by the Returning Officer.`,
      actionUrl: '/admin/candidates',
      icon: 'user-plus',
      relatedResource: 'candidate',
      relatedResourceId: saved.id,
    });

    // Notify the RO that the candidate was submitted
    await this.notificationService.create({
      userId: roId,
      userRole: 'ro',
      type: 'success',
      title: 'Candidate Submitted',
      message: `${data.firstName} ${data.lastName} has been submitted for ${data.position}. Awaiting admin approval.`,
      actionUrl: '/ro/candidates',
      icon: 'check',
      relatedResource: 'candidate',
      relatedResourceId: saved.id,
    });

    return {
      id: saved.id,
      candidateNumber: saved.candidateNumber,
      firstName: saved.firstName,
      lastName: saved.lastName,
      partyName: saved.partyName,
      partyAbbreviation: saved.partyAbbreviation,
      position: saved.position,
      status: saved.status,
      submittedAt: saved.submittedAt,
    };
  }

  async approveCandidate(candidateId: string, roId: string): Promise<any> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
      relations: ['county'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    if (candidate.countyId !== ro.assignedCountyId) {
      throw new Error('Candidate is not in your assigned county');
    }

    await this.candidateRepository.update(candidateId, {
      status: 'approved',
      approvedAt: new Date(),
    });

    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'candidate_approved',
      resource: 'candidate',
      resourceId: candidateId,
      newValue: { status: 'approved', approvedAt: new Date() },
    });

    return { approved: true, candidateId };
  }

  async rejectCandidate(candidateId: string, roId: string, reason?: string): Promise<any> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
      relations: ['county'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const ro = await this.roRepository.findOne({
      where: { id: roId },
    });

    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    if (candidate.countyId !== ro.assignedCountyId) {
      throw new Error('Candidate is not in your assigned county');
    }

    await this.candidateRepository.update(candidateId, {
      status: 'rejected',
    });

    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'candidate_rejected',
      resource: 'candidate',
      resourceId: candidateId,
      newValue: { status: 'rejected', reason },
    });

    return { rejected: true, candidateId };
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

  async getActiveBatches(roId: string): Promise<any[]> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const batches = await this.batchRepository.find({
      where: { status: 'active' } as any,
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return batches.map(batch => ({
      id: batch.id,
      batchId: batch.batchId,
      electionId: batch.electionId,
      status: batch.status,
      currentVoters: batch.currentVoters,
      targetSize: batch.targetSize,
      votesCollected: batch.votesCollected,
      startedAt: batch.startedAt,
      expiresAt: batch.expiresAt,
    }));
  }

  async getBatchDetails(batchId: string, roId: string): Promise<any> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const batch = await this.batchRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return {
      id: batch.id,
      batchId: batch.batchId,
      electionId: batch.electionId,
      status: batch.status,
      currentVoters: batch.currentVoters,
      targetSize: batch.targetSize,
      votesCollected: batch.votesCollected,
      startedAt: batch.startedAt,
      completedAt: batch.completedAt,
      expiresAt: batch.expiresAt,
      blockchainTxHash: batch.blockchainTxHash,
    };
  }

  async closeBatch(batchId: string, roId: string): Promise<{ closed: boolean; batchId: string }> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const batch = await this.batchRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    await this.batchRepository.update(batchId, {
      status: 'closed',
      completedAt: new Date(),
    });

    await this.auditLogRepository.save({
      userId: roId,
      userRole: 'ro',
      action: 'batch_closed',
      resource: 'batch',
      resourceId: batchId,
      newValue: { status: 'closed', closedAt: new Date() },
    });

    return { closed: true, batchId };
  }

  async getElections(roId: string): Promise<any[]> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const elections = await this.electionRepository.find({
      where: { status: 'active' } as any,
      order: { electionDate: 'ASC' },
    });

    return elections.map(election => ({
      id: election.id,
      electionName: election.electionName,
      electionType: election.electionType,
      electionDate: election.electionDate,
      status: election.status,
      totalVotesCast: election.totalVotesCast,
      turnoutPercentage: election.turnoutPercentage,
      votingStartDate: election.votingStartDate,
      votingEndDate: election.votingEndDate,
    }));
  }

  async getVoterStatistics(roId: string): Promise<any> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    const [total, registered, verified, pending, rejected] = await Promise.all([
      this.voterRepository.count({ where: { countyId } as any }),
      this.voterRepository.count({ where: { countyId, status: 'registered' } as any }),
      this.voterRepository.count({ where: { countyId, status: 'verified' } as any }),
      this.voterRepository.count({ where: { countyId, status: 'pending' } as any }),
      this.voterRepository.count({ where: { countyId, status: 'rejected' } as any }),
    ]);

    // Get by constituency breakdown
    const constituencies = await this.constituencyRepository.find({ where: { countyId } as any });
    const byConstituency = await Promise.all(
      constituencies.map(async (constituency) => {
        const [constTotal, constRegistered, constVerified] = await Promise.all([
          this.voterRepository.count({ where: { constituencyId: constituency.id } as any }),
          this.voterRepository.count({ where: { constituencyId: constituency.id, status: 'registered' } as any }),
          this.voterRepository.count({ where: { constituencyId: constituency.id, status: 'verified' } as any }),
        ]);
        return {
          constituency: constituency.constituencyName,
          total: constTotal,
          registered: constRegistered,
          verified: constVerified,
        };
      }),
    );

    return {
      total,
      registered,
      verified,
      pending,
      rejected,
      byConstituency,
    };
  }

  async getVotingStatistics(roId: string): Promise<any> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get total registered voters in county
    const totalRegistered = await this.voterRepository.count({ where: { countyId } as any });

    // Get total votes cast
    const totalVoted = await this.voteRepository.count({
      where: { voter: { countyId } as any } as any,
    });

    const turnout = totalRegistered > 0 ? (totalVoted / totalRegistered) * 100 : 0;

    // Get votes in last hour (simplified)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastHour = await this.voteRepository.count({
      where: {
        voter: { countyId } as any,
        submittedAt: undefined as any, // Simplified - would need proper date filter
      } as any,
    });

    // Generate hourly breakdown (mock for now)
    const byHour: Array<{ hour: string; votes: number }> = [];
    for (let i = 0; i < 24; i++) {
      byHour.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        votes: Math.floor(Math.random() * 50),
      });
    }

    return {
      totalRegistered,
      totalVoted,
      turnout: Math.round(turnout * 100) / 100,
      lastHour,
      byHour,
    };
  }

  async getVotingProgress(roId: string): Promise<any[]> {
    const ro = await this.roRepository.findOne({ where: { id: roId } });
    if (!ro) {
      throw new NotFoundException('Returning Officer not found');
    }

    const countyId = ro.assignedCountyId;

    // Get active elections
    const elections = await this.electionRepository.find({
      where: { status: 'active' } as any,
    });

    const progress = await Promise.all(
      elections.map(async (election) => {
        const totalRegistered = await this.voterRepository.count({ where: { countyId } as any });
        const totalVoted = await this.voteRepository.count({
          where: { electionId: election.id } as any,
        });
        const turnout = totalRegistered > 0 ? (totalVoted / totalRegistered) * 100 : 0;

        // Get by constituency breakdown
        const constituencies = await this.constituencyRepository.find({ where: { countyId } as any });
        const byConstituency = await Promise.all(
          constituencies.map(async (constituency) => {
            const [reg, voted] = await Promise.all([
              this.voterRepository.count({ where: { constituencyId: constituency.id } as any }),
              this.voteRepository.count({
                where: { electionId: election.id } as any, // Simplified
              }),
            ]);
            return {
              constituency: constituency.constituencyName,
              registered: reg,
              voted,
              turnout: reg > 0 ? (voted / reg) * 100 : 0,
            };
          }),
        );

        return {
          electionId: election.id,
          electionName: election.electionName,
          totalRegistered,
          totalVoted,
          turnout: Math.round(turnout * 100) / 100,
          byConstituency,
        };
      }),
    );

    return progress;
  }
}
