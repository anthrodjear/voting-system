import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { County } from './county.entity';
import { Constituency } from './constituency.entity';
import { Ward } from './ward.entity';
import { Election } from './election.entity';

/**
 * Candidate Entity - Candidate information for various positions
 * 
 * Database Optimization Notes:
 * - Index on candidate_number (unique constraint automatically creates btree index)
 * - Index on position for快速position类型筛选
 * - Index on status for快速审批状态查询
 * - Index on election_id for特定选举的候选人查询
 * - 复合索引 on (election_id, position) for选举中的position分类查询
 * - FK indexes on county_id, constituency_id, ward_id created by ManyToOne relationships
 */
@Entity('candidates')
@Index('idx_candidates_position', ['position'])
@Index('idx_candidates_status', ['status'])
@Index('idx_candidates_election', ['electionId'])
@Index('idx_candidates_election_position', ['electionId', 'position'])
@Index('idx_candidates_county', ['countyId'])
@Index('idx_candidates_constituency', ['constituencyId'])
@Index('idx_candidates_ward', ['wardId'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'candidate_number', unique: true, length: 10 })
  candidateNumber: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ length: 20 })
  position: string;

  @Column({ name: 'county_id', nullable: true })
  countyId: string;

  @Column({ name: 'county_name', nullable: true })
  countyName: string;

  @Column({ name: 'constituency_id', nullable: true })
  constituencyId: string;

  @Column({ name: 'ward_id', nullable: true })
  wardId: string;

  @Column({ name: 'party_name', length: 200, nullable: true })
  partyName: string;

  @Column({ name: 'party_abbreviation', length: 10, nullable: true })
  partyAbbreviation: string;

  @Column({ name: 'party_color', length: 7, nullable: true })
  partyColor: string;

  @Column({ name: 'is_independent', default: false })
  isIndependent: boolean;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  manifesto: string;

  @Column({ name: 'manifesto_highlights', type: 'text', array: true, nullable: true })
  manifestoHighlights: string[];

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'election_id', nullable: true })
  electionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationship: Candidate belongs to one County (optional - for Governor/Senator)
   */
  @ManyToOne(() => County, { nullable: true })
  @JoinColumn({ name: 'county_id' })
  county: County;

  /**
   * Relationship: Candidate belongs to one Constituency (optional - for MP/MCA)
   */
  @ManyToOne(() => Constituency, { nullable: true })
  @JoinColumn({ name: 'constituency_id' })
  constituency: Constituency;

  /**
   * Relationship: Candidate belongs to one Ward (optional - for MCA)
   */
  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  /**
   * Relationship: Candidate belongs to one Election (optional)
   */
  @ManyToOne(() => Election, { nullable: true })
  @JoinColumn({ name: 'election_id' })
  election: Election;
}