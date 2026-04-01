import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Batch Entity - Batch processing for votes (offline voting)
 * 
 * Database Optimization Notes:
 * - Index on batch_id (unique constraint automatically creates btree index)
 * - Index on election_id for特定选举的批次查询
 * - Index on status for批次状态过滤
 */
@Entity('batches')
@Index('idx_batch_election', ['electionId'])
@Index('idx_batch_status', ['status'])
@Index('idx_batch_batch_id', ['batchId'], { unique: true })
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  batchId: string;

  @Column({ name: 'election_id' })
  electionId: string;

  @Column({ default: 'waiting' })
  status: string;

  @Column({ name: 'target_size', default: 1000 })
  targetSize: number;

  @Column({ name: 'current_voters', default: 0 })
  currentVoters: number;

  @Column({ name: 'votes_collected', default: 0 })
  votesCollected: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'blockchain_tx_hash', length: 100, nullable: true })
  blockchainTxHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}