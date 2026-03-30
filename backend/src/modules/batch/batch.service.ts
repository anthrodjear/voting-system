import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Batch } from '../../entities/batch.entity';
import { Election } from '../../entities/election.entity';
import { Vote } from '../../entities/vote.entity';
import { JoinBatchDto, BatchVoteDto } from '../../dto/batch.dto';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly voterBatches = new Map<string, string>(); // voterId -> batchId

  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async join(voterId: string, dto?: JoinBatchDto): Promise<any> {
    // Get active election
    const election = await this.electionRepository.findOne({
      where: { status: 'voting' },
    });

    if (!election) {
      throw new BadRequestException('No active election');
    }

    // Find or create a batch
    let batch = await this.batchRepository.findOne({
      where: { electionId: election.id, status: 'waiting' },
      order: { currentVoters: 'ASC' },
    });

    if (!batch || batch.currentVoters >= batch.targetSize) {
      const batchId = `batch_${uuidv4().slice(0, 8).toUpperCase()}`;
      batch = await this.batchRepository.save({
        batchId,
        electionId: election.id,
        status: 'waiting',
        targetSize: 1000,
        currentVoters: 0,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
    }

    // Add voter to batch
    await this.batchRepository.increment({ id: batch.id }, 'currentVoters', 1);
    this.voterBatches.set(voterId, batch.id);

    // If batch is full, start it
    const updatedBatch = await this.batchRepository.findOne({ where: { id: batch.id } });
    if (updatedBatch && updatedBatch.currentVoters >= updatedBatch.targetSize) {
      await this.batchRepository.update(batch.id, {
        status: 'active',
        startedAt: new Date(),
      });
    }

    this.logger.log(`Voter ${voterId} joined batch ${batch.batchId}`);

    return {
      batchId: batch.batchId,
      assignedPosition: updatedBatch?.currentVoters || 1,
      estimatedWait: 30,
      batchSize: batch.targetSize,
      currentVoters: updatedBatch?.currentVoters || 1,
    };
  }

  async submitVote(voterId: string, batchId: string, dto: BatchVoteDto): Promise<any> {
    const batch = await this.batchRepository.findOne({
      where: { batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // In a real implementation, we'd queue the vote
    // For now, we return success
    await this.batchRepository.increment({ id: batch.id }, 'votesCollected', 1);

    // Clear voter from batch
    this.voterBatches.delete(voterId);

    return {
      queued: true,
      queuePosition: 1,
      estimatedConfirmation: 15,
    };
  }

  async getStatus(batchId: string): Promise<any> {
    const batch = await this.batchRepository.findOne({
      where: { batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    let timeRemaining: number | undefined;
    if (batch.expiresAt) {
      timeRemaining = Math.max(0, Math.floor((batch.expiresAt.getTime() - Date.now()) / 1000));
    }

    return {
      batchId: batch.batchId,
      status: batch.status,
      totalVoters: batch.targetSize,
      currentVoters: batch.currentVoters,
      votesCollected: batch.votesCollected,
      timeRemaining,
    };
  }

  async heartbeat(voterId: string): Promise<{ heartbeatReceived: boolean; positionSecured: boolean }> {
    const batchId = this.voterBatches.get(voterId);
    
    if (!batchId) {
      return { heartbeatReceived: false, positionSecured: false };
    }

    return {
      heartbeatReceived: true,
      positionSecured: true,
    };
  }

  async leave(voterId: string, batchId: string): Promise<{ message: string; canRejoin: boolean }> {
    const batch = await this.batchRepository.findOne({
      where: { batchId },
    });

    if (batch) {
      await this.batchRepository.decrement({ id: batch.id }, 'currentVoters', 1);
    }

    this.voterBatches.delete(voterId);

    return {
      message: 'Removed from batch',
      canRejoin: true,
    };
  }
}
