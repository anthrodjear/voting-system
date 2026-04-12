import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { Vote } from '../../entities/vote.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Voter } from '../../entities/voter.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { CastVoteDto } from '../../dto/vote.dto';
import { BlockchainService } from '../../services/blockchain.service';

@Injectable()
export class VoteService {
  private readonly logger = new Logger(VoteService.name);

  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(VoteTracking)
    private trackingRepository: Repository<VoteTracking>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getBallot(voterId: string): Promise<any> {
    const voter = await this.voterRepository.findOne({ where: { id: voterId } });
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Get current active election
    const election = await this.electionRepository.findOne({
      where: { status: 'voting' },
    });

    if (!election) {
      throw new BadRequestException('No active election');
    }

    // Get all approved candidates
    const candidates = await this.candidateRepository.find({
      where: { status: 'approved', electionId: election.id },
      relations: ['county'],
    });

    // Group candidates by position
    const positions = ['president', 'governor', 'senator', 'mp', 'mca'];
    const ballotPositions = positions.map((position) => {
      const positionCandidates = candidates
        .filter((c) => c.position === position)
        .map((c) => ({
          candidateId: c.id,
          fullName: `${c.firstName} ${c.lastName}`,
          photo: c.photo,
        }));

      return {
        position,
        candidates: positionCandidates,
      };
    }).filter((p) => p.candidates.length > 0);

    return {
      ballotId: `ballot_${election.id}`,
      electionId: election.id,
      positions: ballotPositions,
    };
  }

  async castVote(voterId: string, dto: CastVoteDto): Promise<{ confirmationId: string; voteHash: string; timestamp: Date; blockchainTxHash?: string; message: string }> {
    const voter = await this.voterRepository.findOne({ where: { id: voterId } });
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Check if voter has already voted locally
    const existingTracking = await this.trackingRepository.findOne({
      where: { voterId },
    });

    if (existingTracking?.hasVoted) {
      throw new ForbiddenException('You have already cast your vote');
    }

    // Get active election
    const election = await this.electionRepository.findOne({
      where: { status: 'voting' },
    });

    if (!election) {
      throw new BadRequestException('No active election');
    }

    // Validate voter eligibility on blockchain before casting
    const eligibility = await this.blockchainService.validateVoterEligibility(voterId);
    if (!eligibility.eligible) {
      throw new ForbiddenException(`Voter is not eligible to vote: ${eligibility.reason}`);
    }

    // Generate vote hash locally for audit and confirmation
    const voteHash = createHash('sha256')
      .update(dto.encryptedVote + Date.now())
      .digest('hex');

    // Export the vote on-chain and store the resulting transaction data
    const receipt = await this.blockchainService.recordVoteHash(
      voterId,
      dto.encryptedVote,
      dto.zkProof || '',
    );

    // Generate confirmation number
    const confirmationNumber = this.generateConfirmationNumber();

    // Save vote locally after successful blockchain recording
    const vote = await this.voteRepository.save({
      voterId,
      electionId: election.id,
      encryptedVote: dto.encryptedVote,
      voteHash,
      zkProof: dto.zkProof,
      batchId: dto.batchId,
      blockchainTxHash: receipt.transactionHash,
      confirmationNumber,
      status: 'confirmed',
      confirmedAt: new Date(),
      blockNumber: receipt.blockNumber,
    });

    // Update tracking - reuse existing tracking variable
    if (existingTracking) {
      await this.trackingRepository.update(existingTracking.id, {
        electionId: election.id,
        hasVoted: true,
        votedAt: new Date(),
        confirmationNumber,
      });
    } else {
      await this.trackingRepository.save({
        voterId,
        electionId: election.id,
        hasVoted: true,
        votedAt: new Date(),
        confirmationNumber,
      });
    }

    // Update election vote count
    await this.electionRepository.increment({ id: election.id }, 'totalVotesCast', 1);

    // Audit log
    await this.auditLogRepository.save({
      userId: voterId,
      userRole: 'voter',
      action: 'vote_cast',
      resource: 'vote',
      resourceId: vote.id,
      newValue: { electionId: election.id, confirmationNumber, blockchainTxHash: receipt.transactionHash },
    });

    this.logger.log(`Vote cast by voter ${voterId}, confirmation: ${confirmationNumber}`);

    return {
      confirmationId: confirmationNumber,
      voteHash,
      timestamp: new Date(),
      blockchainTxHash: receipt.transactionHash,
      message: 'Vote recorded successfully',
    };
  }

  async getConfirmation(confirmationId: string): Promise<any> {
    const vote = await this.voteRepository.findOne({
      where: { confirmationNumber: confirmationId },
      relations: ['election'],
    });

    if (!vote) {
      throw new NotFoundException('Vote confirmation not found');
    }

    return {
      confirmationId: vote.confirmationNumber,
      voteHash: vote.voteHash,
      timestamp: vote.submittedAt,
      status: vote.status,
      blockchainTxHash: vote.blockchainTxHash,
    };
  }

  async getStatus(voterId: string): Promise<{ hasVoted: boolean; votedAt?: Date; confirmationId?: string }> {
    const tracking = await this.trackingRepository.findOne({
      where: { voterId },
    });

    if (!tracking || !tracking.hasVoted) {
      return { hasVoted: false };
    }

    return {
      hasVoted: true,
      votedAt: tracking.votedAt,
      confirmationId: tracking.confirmationNumber,
    };
  }

  private generateConfirmationNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VN${result}`;
  }
}
