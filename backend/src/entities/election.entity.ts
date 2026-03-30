import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('elections')
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
