import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Voter } from './voter.entity';
import { Election } from './election.entity';

/**
 * Vote Entity - Individual vote records
 * 
 * Database Optimization Notes (Critical for 20M+ voters, 5,000 votes/sec):
 * - Primary index on id (UUID) - TypeORM creates this automatically
 * - Index on voter_id + election_id (unique constraint for one-vote-per-election)
 * - Index on vote_hash for区块链verification查询
 * - Index on confirmation_number for选民确认码查询
 * - Index on status用于状态过滤
 * - Index on submitted_at用于时间范围查询知道你
 * 
 * PARTITIONING STRATEGY (建议for PostgreSQL 15+):
 * - 按election_id分区创建votes_election_<id>子表
 * - 使用List分区: PARTITION BY LIST (election_id)
 * - 每个分区创建单独的序列号sequence以优化bigint主键
 * 
 * PARTIAL INDEXES (for common queries):
 * - CREATE INDEX idx_votes_confirmed ON votes WHERE status = 'confirmed'
 * - CREATE INDEX idx_votes_pending ON votes WHERE status = 'pending'
 * 
 * MATERIALIZED VIEWS:
 * - election_results_by_county: 按county聚合的选举结果
 * - election_results_by_constituency: 按constituency聚合
 * - election_results_live: 实时选举结果视图 (每分钟刷新)
 * - voter_turnout_by_region: 各地选民投票率
 * 
 * CASCADE DELETE WARNING:
 * - 此表数据量巨大,不建议使用CASCADE删除
 * - 使用软删除 (soft delete) + 归档策略
 */
@Entity('votes')
@Index('idx_votes_voter_election', ['voterId', 'electionId'], { unique: true })
@Index('idx_votes_election', ['electionId'])
@Index('idx_votes_hash', ['voteHash'])
@Index('idx_votes_confirmation', ['confirmationNumber'], { unique: true })
@Index('idx_votes_status', ['status'])
@Index('idx_votes_submitted', ['submittedAt'])
@Index('idx_votes_batch', ['batchId'])
@Index('idx_votes_blockchain', ['blockchainTxHash'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voter_id', nullable: true })
  voterId: string;

  @Column({ name: 'election_id', nullable: true })
  electionId: string;

  @Column({ name: 'encrypted_vote', type: 'text' })
  encryptedVote: string;

  @Column({ name: 'vote_hash', length: 64 })
  voteHash: string;

  @Column({ name: 'zk_proof', type: 'text', nullable: true })
  zkProof: string;

  @Column({ name: 'batch_id', length: 50, nullable: true })
  batchId: string;

  @Column({ name: 'blockchain_tx_hash', length: 100, nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'confirmation_number', unique: true, length: 20 })
  confirmationNumber: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'block_number', nullable: true })
  blockNumber: number;

  /**
   * Relationship: Vote belongs to one Voter
   * Foreign Key: voter_id references voters(id)
   */
  @ManyToOne(() => Voter, { nullable: true })
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;

  /**
   * Relationship: Vote belongs to one Election
   * Foreign Key: election_id references elections(id)
   */
  @ManyToOne(() => Election, { nullable: true })
  @JoinColumn({ name: 'election_id' })
  election: Election;
}