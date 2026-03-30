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

@Entity('voter_biometrics')
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

  @OneToOne(() => Voter, (voter) => voter.biometric)
  @JoinColumn({ name: 'voter_id' })
  voter: Voter;
}
