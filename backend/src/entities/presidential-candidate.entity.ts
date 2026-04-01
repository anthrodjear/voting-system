import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Candidate } from './candidate.entity';

/**
 * PresidentialCandidate Entity - Additional data for presidential candidates
 * 
 * Database Optimization Notes:
 * - Index on candidate_id (unique constraint automatically creates btree index)
 * - Index on nomination_county fornomination county查询
 */
@Entity('presidential_candidates')
@Index('idx_pc_candidate', ['candidateId'], { unique: true })
@Index('idx_pc_nomination', ['nominationCounty'])
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

  /**
   * Relationship: One PresidentialCandidate belongs to one Candidate
   * Foreign Key: candidate_id references candidates(id)
   */
  @OneToOne(() => Candidate, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
}