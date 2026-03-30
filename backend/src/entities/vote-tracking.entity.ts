import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Voter } from './voter.entity';
import { Election } from './election.entity';

@Entity('vote_tracking')
export class VoteTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voter_id', unique: true })
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

  @OneToOne(() => Voter)
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;

  @OneToOne(() => Election)
  @JoinColumn({ name: 'election_id' })
  election: Election;
}
