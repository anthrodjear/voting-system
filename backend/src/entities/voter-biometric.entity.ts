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

/**
 * VoterBiometric Entity - Biometric data for voter verification
 * 
 * Database Optimization Notes:
 * - Index on voter_id (unique constraint automatically creates btree index)
 * - Separate index on (face_enrolled, fingerprint_enrolled) for快速biometric enrollment状态查询
 * - 建议加密存储biometric templates (使用应用层加密而非数据库透明加密)
 */
@Entity('voter_biometrics')
@Index('idx_biometrics_voter', ['voterId'])
@Index('idx_biometrics_face_enrolled', ['faceEnrolled'])
@Index('idx_biometrics_fingerprint_enrolled', ['fingerprintEnrolled'])
export class VoterBiometric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voter_id', unique: true })
  voterId: string;

  @Column({ name: 'face_template', type: 'text', nullable: true })
  faceTemplate: string;

  @Column({ name: 'face_enrolled_at', nullable: true })
  faceEnrolledAt: Date;

  @Column({ name: 'face_enrolled', default: false })
  faceEnrolled: boolean;

  @Column({ name: 'face_quality_score', type: 'float', nullable: true })
  faceQualityScore: number;

  @Column({ name: 'left_thumb_template', type: 'text', nullable: true })
  leftThumbTemplate: string;

  @Column({ name: 'right_thumb_template', type: 'text', nullable: true })
  rightThumbTemplate: string;

  @Column({ name: 'fingerprint_enrolled_at', nullable: true })
  fingerprintEnrolledAt: Date;

  @Column({ name: 'fingerprint_enrolled', default: false })
  fingerprintEnrolled: boolean;

  @Column({ name: 'fingerprint_quality_score', type: 'float', nullable: true })
  fingerprintQualityScore: number;

  @Column({ name: 'liveness_challenge', type: 'text', nullable: true })
  livenessChallenge: string;

  @Column({ name: 'liveness_generated_at', nullable: true })
  livenessGeneratedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relationship: One VoterBiometric belongs to one Voter
   * Foreign Key: voter_id references voters(id)
   * On Delete: CASCADE - delete biometric data when voter is deleted
   */
  @OneToOne(() => Voter, (voter) => voter.biometric, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;
}