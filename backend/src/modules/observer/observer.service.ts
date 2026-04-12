import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Voter } from '../../entities/voter.entity';
import { Vote } from '../../entities/vote.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Election } from '../../entities/election.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import { BlockchainService } from '../../services/blockchain.service';

/**
 * Election statistics response
 */
export interface ElectionStats {
  totalRegistered: number;
  totalVotes: number;
  turnoutPercentage: number;
  electionStatus: string;
}

/**
 * Candidate result data
 */
export interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

/**
 * Vote verification response
 */
export interface VoteVerification {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  verified: boolean;
  voteHash: string;
}

/**
 * Voter turnout data
 */
export interface VoterTurnout {
  registered: number;
  voted: number;
  percentage: number;
}

/**
 * Report generation data
 */
export interface ReportData {
  type: string;
  format: string;
  data: any;
  generatedAt: Date;
}

@Injectable()
export class ObserverService {
  private readonly logger = new Logger(ObserverService.name);

  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(VoteTracking)
    private trackingRepository: Repository<VoteTracking>,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Get election statistics including total registered voters, total votes, and turnout
   */
  async getElectionStats(): Promise<ElectionStats> {
    this.logger.log('Getting election statistics');

    try {
      // Get current active or most recent election
      const election = await this.electionRepository.findOne({
        where: [{ status: 'voting' }, { status: 'completed' }, { status: 'tallying' }],
        order: { createdAt: 'DESC' },
      });

      // Get total registered voters
      const totalRegistered = await this.voterRepository.count({
        where: { status: 'active' },
      });

      // Get total votes for this election
      let totalVotes = 0;
      let electionStatus = 'unknown';

      if (election) {
        const votes = await this.voteRepository.count({
          where: { electionId: election.id, status: 'confirmed' },
        });
        totalVotes = votes;
        electionStatus = election.status;
      } else {
        // Fallback: get all confirmed votes
        totalVotes = await this.voteRepository.count({
          where: { status: 'confirmed' },
        });
      }

      // Calculate turnout percentage
      const turnoutPercentage = totalRegistered > 0
        ? Math.round((totalVotes / totalRegistered) * 100 * 100) / 100
        : 0;

      return {
        totalRegistered,
        totalVotes,
        turnoutPercentage,
        electionStatus,
      };
    } catch (error) {
      this.logger.error(`Failed to get election stats: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get candidate results with vote counts and percentages
   */
  async getCandidateResults(): Promise<CandidateResult[]> {
    this.logger.log('Getting candidate results');

    try {
      // Get current active or most recent election
      const election = await this.electionRepository.findOne({
        where: [{ status: 'voting' }, { status: 'completed' }, { status: 'tallying' }],
        order: { createdAt: 'DESC' },
      });

      if (!election) {
        // Return empty array if no election
        return [];
      }

      // Get all approved candidates for this election
      const candidates = await this.candidateRepository.find({
        where: { status: 'approved', electionId: election.id },
      });

      // Get total votes for this election
      const totalVotes = await this.voteRepository.count({
        where: { electionId: election.id, status: 'confirmed' },
      });

      // Calculate votes for each candidate
      const results: CandidateResult[] = [];

      for (const candidate of candidates) {
        // Count votes for this candidate (aggregate across all positions)
        const voteCount = await this.voteRepository
          .createQueryBuilder('vote')
          .where('vote.candidateId = :candidateId', { candidateId: candidate.id })
          .andWhere('vote.electionId = :electionId', { electionId: election.id })
          .andWhere('vote.status = :status', { status: 'confirmed' })
          .getCount();

        const percentage = totalVotes > 0
          ? Math.round((voteCount / totalVotes) * 100 * 100) / 100
          : 0;

        results.push({
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          party: candidate.partyName || candidate.partyAbbreviation || 'Independent',
          votes: voteCount,
          percentage,
        });
      }

      // Sort by votes descending
      results.sort((a, b) => b.votes - a.votes);

      return results;
    } catch (error) {
      this.logger.error(`Failed to get candidate results: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Verify a vote by transaction hash
   */
  async verifyVote(transactionHash: string): Promise<VoteVerification> {
    this.logger.log(`Verifying vote with transaction hash: ${transactionHash}`);

    try {
      // First check local database
      const vote = await this.voteRepository.findOne({
        where: { blockchainTxHash: transactionHash },
      });

      if (vote) {
        return {
          transactionHash: vote.blockchainTxHash,
          blockNumber: vote.blockNumber || 0,
          timestamp: vote.submittedAt,
          verified: vote.status === 'confirmed',
          voteHash: vote.voteHash,
        };
      }

      // If not in local DB, try blockchain verification
      try {
        const web3 = this.blockchainService.getWeb3();
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (receipt) {
          const block = await web3.eth.getBlock(receipt.blockNumber);
          return {
            transactionHash,
            blockNumber: Number(receipt.blockNumber),
            timestamp: new Date(Number(block.timestamp) * 1000),
            verified: Boolean(receipt.status),
            voteHash: '',
          };
        }
      } catch (blockchainError) {
        this.logger.warn(`Blockchain verification failed: ${(blockchainError as Error).message}`);
      }

      // If not found anywhere
      throw new NotFoundException(`Vote with transaction hash ${transactionHash} not found`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to verify vote: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get voter turnout statistics
   */
  async getVoterTurnout(): Promise<VoterTurnout> {
    this.logger.log('Getting voter turnout statistics');

    try {
      // Get current active or most recent election
      const election = await this.electionRepository.findOne({
        where: [{ status: 'voting' }, { status: 'completed' }, { status: 'tallying' }],
        order: { createdAt: 'DESC' },
      });

      // Total registered voters
      const registered = await this.voterRepository.count({
        where: { status: 'active' },
      });

      // Voters who have voted
      let voted = 0;

      if (election) {
        voted = await this.trackingRepository
          .createQueryBuilder('tracking')
          .where('tracking.hasVoted = :hasVoted', { hasVoted: true })
          .andWhere('tracking.electionId = :electionId', { electionId: election.id })
          .getCount();
      } else {
        // Fallback: count all voters who have voted
        voted = await this.trackingRepository.count({
          where: { hasVoted: true },
        });
      }

      // Calculate percentage
      const percentage = registered > 0
        ? Math.round((voted / registered) * 100 * 100) / 100
        : 0;

      return {
        registered,
        voted,
        percentage,
      };
    } catch (error) {
      this.logger.error(`Failed to get voter turnout: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Generate reports for export
   */
  async generateReport(type: string, format: string): Promise<ReportData> {
    this.logger.log(`Generating report: type=${type}, format=${format}`);

    try {
      let reportData: any;

      switch (type) {
        case 'election-results':
          // Get election results
          const candidates = await this.getCandidateResults();
          const stats = await this.getElectionStats();
          reportData = {
            statistics: stats,
            candidates,
          };
          break;

        case 'voter-turnout':
          // Get voter turnout
          const turnout = await this.getVoterTurnout();
          reportData = turnout;
          break;

        case 'votes':
          // Get all votes
          const election = await this.electionRepository.findOne({
            where: [{ status: 'voting' }, { status: 'completed' }, { status: 'tallying' }],
            order: { createdAt: 'DESC' },
          });

          if (!election) {
            reportData = { votes: [] };
          } else {
            const votes = await this.voteRepository.find({
              where: { electionId: election.id },
              relations: ['candidate'],
              order: { submittedAt: 'DESC' },
              take: 1000, // Limit for performance
            });

            reportData = {
              votes: votes.map(v => ({
                id: v.id,
                voterId: v.voterId,
                electionId: v.electionId,
                voteHash: v.voteHash,
                transactionHash: v.blockchainTxHash,
                status: v.status,
                submittedAt: v.submittedAt,
              })),
            };
          }
          break;

        case 'voters':
          // Get voter list
          const voters = await this.voterRepository.find({
            where: { status: 'active' },
            take: 1000, // Limit for performance
          });

          reportData = {
            voters: voters.map(v => ({
              id: v.id,
              nationalId: v.nationalId,
              firstName: v.firstName,
              lastName: v.lastName,
              countyName: v.countyName,
              constituencyName: v.constituencyName,
              status: v.status,
            })),
          };
          break;

        default:
          throw new Error(`Unknown report type: ${type}`);
      }

      return {
        type,
        format,
        data: reportData,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate report: ${(error as Error).message}`);
      throw error;
    }
  }
}