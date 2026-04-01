import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Voter } from './voter.entity';
import { Election } from './election.entity';

/**
 * VoteTracking Entity - Track which voters have voted in which elections
 * 
 * Database Optimization Notes:
 * - Index on voter_id + election_id (composite unique constraint)
 * - Index on has_voted for快速筛选已投票选民
 * - 这个表对于投票检查至关重要，需要正确索引以避免重复投票
 * - 建议使用BRIN索引(如果使用PostgreSQL 14+): 
 *   CREATE INDEX idx_vote_tracking_created_brin ON vote_tracking USING BRIN (created_at)
 */
@Entity('vote_tracking')
@Index('idx_vote_tracking_voter_election', ['voterId', 'electionId'], { unique: true })
@Index('idx_vote_tracking_voted', ['hasVoted'])
@Index('idx_vote_tracking_election', ['electionId'])
export class VoteTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voter_id' })
  voterId: string;

  @Column({ name: 'election_id' })
  electionId: string;

  @Column({ name: 'has_voted', default: false })
  hasVoted: boolean;

  @Column({ name: 'voted_at', nullable: true })
  votedAt: Date;

  @Column({ name: 'confirmation_number', nullable: true, length: 20 })
  confirmationNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationship: VoteTracking belongs to one Voter
   * On Delete: CASCADE - delete tracking when voter is deleted
   */
  @OneToOne(() => Voter, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;

  /**
   * Relationship: VoteTracking belongs to one Election
   * On Delete: CASCADE - delete tracking when election is deleted
   */
  @OneToOne(() => Election, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: Election;
}