import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity('presidential_candidates')
export class PresidentialCandidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'candidate_id', unique: true })
  candidateId: string;

  @Column({ name: 'deputy_full_name', length: 200 })
  deputyFullName: string;

  @Column({ name: 'deputy_date_of_birth', type: 'date', nullable: true })
  deputyDateOfBirth: Date;

  @Column({ name: 'deputy_photo', type: 'text', nullable: true })
  deputyPhoto: string;

  @Column({ name: 'nomination_date', type: 'date' })
  nominationDate: Date;

  @Column({ name: 'nomination_county', length: 100 })
  nominationCounty: string;

  @Column({ name: 'nominator_count', default: 0 })
  nominatorCount: number;

  @Column({ name: 'campaign_slogan', length: 200, nullable: true })
  campaignSlogan: string;

  @Column({ name: 'ballot_symbol', length: 50, nullable: true })
  ballotSymbol: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
}
