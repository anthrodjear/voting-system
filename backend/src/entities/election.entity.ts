import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Election Entity - Election information and configuration
 * 
 * Database Optimization Notes:
 * - Index on election_type for快速筛选general/by-election类型
 * - Index on status for快速pending/active状态查询
 * - Index on election_date for日期范围查询
 * - 复合索引 on (status, election_date) for查找特定日期范围的active选举
 * - Materialized view建议for快速选举结果查询
 */
@Entity('elections')
@Index('idx_elections_type', ['electionType'])
@Index('idx_elections_status', ['status'])
@Index('idx_elections_date', ['electionDate'])
@Index('idx_elections_status_date', ['status', 'electionDate'])
export class Election {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'election_name', length: 200 })
  electionName: string;

  @Column({ name: 'election_type', length: 50 })
  electionType: string;

  @Column({ name: 'election_date', type: 'date' })
  electionDate: Date;

  @Column({ name: 'registration_start_date', type: 'timestamp', nullable: true })
  registrationStartDate: Date;

  @Column({ name: 'registration_end_date', type: 'timestamp', nullable: true })
  registrationEndDate: Date;

  @Column({ name: 'nomination_start_date', type: 'timestamp', nullable: true })
  nominationStartDate: Date;

  @Column({ name: 'nomination_end_date', type: 'timestamp', nullable: true })
  nominationEndDate: Date;

  @Column({ name: 'voting_start_date', type: 'timestamp', nullable: true })
  votingStartDate: Date;

  @Column({ name: 'voting_end_date', type: 'timestamp', nullable: true })
  votingEndDate: Date;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'enable_online_voting', default: true })
  enableOnlineVoting: boolean;

  @Column({ name: 'total_votes_cast', default: 0 })
  totalVotesCast: number;

  @Column({ name: 'turnout_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoutPercentage: number;

  @Column({ name: 'blockchain_contract_address', length: 100, nullable: true })
  blockchainContractAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}