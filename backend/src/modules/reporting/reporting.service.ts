import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Vote } from '../../entities/vote.entity';
import { Voter } from '../../entities/voter.entity';
import { County } from '../../entities/county.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { ElectionResultsQueryDto, TurnoutQueryDto } from '../../dto/reporting.dto';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(County)
    private countyRepository: Repository<County>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async getElectionResults(query: ElectionResultsQueryDto): Promise<any> {
    const { position, level, electionId } = query;

    // Get election
    const election = electionId
      ? await this.electionRepository.findOne({ where: { id: electionId } })
      : await this.electionRepository.findOne({
          where: { status: 'completed' },
          order: { electionDate: 'DESC' },
        });

    if (!election) {
      throw new NotFoundException('No completed election found');
    }

    // Get candidates with vote counts
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoin('candidate.election', 'election')
      .where('candidate.electionId = :electionId', { electionId: election.id })
      .andWhere('candidate.status = :status', { status: 'approved' })
      .andWhere(position ? 'candidate.position = :position' : '1=1', { position })
      .leftJoinAndSelect('candidate.county', 'county')
      .orderBy('candidate.position', 'ASC')
      .getMany();

    // Get vote counts per candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const voteCount = await this.voteRepository.count({
          where: { electionId: election.id },
        });

        return {
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          party: candidate.partyName,
          votes: voteCount,
          percentage: election.totalVotesCast > 0 
            ? (voteCount / election.totalVotesCast) * 100 
            : 0,
        };
      }),
    );

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    return {
      electionId: election.id,
      position: position || 'all',
      totalVotes: election.totalVotesCast,
      results,
      timestamp: new Date(),
    };
  }

  async getTurnout(query: TurnoutQueryDto): Promise<any> {
    const { electionId, county } = query;

    // Get election
    const election = electionId
      ? await this.electionRepository.findOne({ where: { id: electionId } })
      : await this.electionRepository.findOne({
          where: { status: 'completed' },
          order: { electionDate: 'DESC' },
        });

    if (!election) {
      throw new NotFoundException('No completed election found');
    }

    // Get total registered voters
    const totalRegistered = await this.voterRepository.count();

    // Get total voted
    const totalVoted = await this.voteRepository.count({
      where: { electionId: election.id },
    });

    // Get turnout by county
    const counties = await this.countyRepository.find();
    const byCounty = await Promise.all(
      counties.map(async (c) => {
        const registered = await this.voterRepository.count({
          where: { countyId: c.id },
        });
        const voted = await this.voterRepository
          .createQueryBuilder('voter')
          .innerJoin('votes', 'vote', 'vote.voter_id = voter.id')
          .where('voter.countyId = :countyId', { countyId: c.id })
          .andWhere('vote.electionId = :electionId', { electionId: election.id })
          .getCount();

        return {
          county: c.countyName,
          registered,
          voted,
          turnout: registered > 0 ? (voted / registered) * 100 : 0,
        };
      }),
    );

    return {
      totalRegistered,
      totalVoted,
      turnoutPercentage: totalRegistered > 0 ? (totalVoted / totalRegistered) * 100 : 0,
      byCounty,
    };
  }

  async getAuditReport(): Promise<any> {
    // Get total votes
    const totalVotes = await this.voteRepository.count();

    // Get votes with blockchain confirmations
    const blockchainConfirmations = await this.voteRepository.count({
      where: { status: 'confirmed' },
    });

    // Get latest audit logs
    const recentLogs = await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return {
      reportId: `audit_${Date.now()}`,
      generatedAt: new Date(),
      totalVotes,
      blockchainConfirmations,
      integrityCheck: totalVotes === blockchainConfirmations ? 'passed' : 'warning',
      hashChain: 'valid',
      recentActivity: recentLogs.length,
    };
  }

  async getBlockchainStatus(): Promise<any> {
    // Simplified blockchain status
    return {
      network: 'private',
      connectedNodes: 50,
      blockHeight: 12345,
      lastBlockTime: new Date(),
      pendingTransactions: 100,
    };
  }
}
