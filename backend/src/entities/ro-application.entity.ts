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
import { ReturningOfficer } from './returning-officer.entity';

/**
 * RoApplication Entity - Returning Officer applications for election cycles
 * 
 * Database Optimization Notes:
 * - Index on ro_id for特定RO的申请查询
 * - Index on election_cycle for特定选举周期的申请查询
 * - Index on status for申请状态过滤
 */
@Entity('ro_applications')
@Index('idx_roapp_ro', ['roId'])
@Index('idx_roapp_cycle', ['electionCycle'])
@Index('idx_roapp_status', ['status'])
@Index('idx_roapp_assigned_county', ['assignedCounty'])
export class RoApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ro_id' })
  roId: string;

  @Column({ name: 'election_cycle', length: 50 })
  electionCycle: string;

  @Column({ name: 'preferred_county1', length: 100 })
  preferredCounty1: string;

  @Column({ name: 'preferred_county2', length: 100 })
  preferredCounty2: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience: number;

  @Column({ name: 'has_prior_experience', default: false })
  hasPriorExperience: boolean;

  @Column({ name: 'prior_experience_details', type: 'text', nullable: true })
  priorExperienceDetails: string;

  @Column({ name: 'uploaded_documents', type: 'jsonb', nullable: true })
  uploadedDocuments: any;

  @Column({ default: 'submitted' })
  status: string;

  @Column({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'assigned_county', length: 100, nullable: true })
  assignedCounty: string;

  @Column({ name: 'assigned_at', nullable: true })
  assignedAt: Date;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationship: RoApplication belongs to one ReturningOfficer
   * Foreign Key: ro_id references returning_officers(id)
   */
  @ManyToOne(() => ReturningOfficer, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ro_id' })
  returningOfficer: ReturningOfficer;
}