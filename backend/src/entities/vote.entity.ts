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

@Entity('votes')
@Index('idx_votes_voter', ['voterId'])
@Index('idx_votes_election', ['electionId'])
@Index('idx_votes_hash', ['voteHash'])
@Index('idx_votes_confirmation', ['confirmationNumber'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voter_id' })
  voterId: string;

  @Column({ name: 'election_id' })
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

  @ManyToOne(() => Voter)
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;

  @ManyToOne(() => Election)
  @JoinColumn({ name: 'election_id' })
  election: Election;
}
