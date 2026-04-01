import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ReturningOfficer Entity - Election returning officers
 * 
 * Database Optimization Notes:
 * - Index on national_id (unique constraint automatically creates btree index)
 * - Index on email (unique constraint automatically creates btree index)
 * - Index on assigned_county_id for特定county的RO查询
 * - Index on status forRO状态过滤
 */
@Entity('returning_officers')
@Index('idx_ro_national', ['nationalId'], { unique: true })
@Index('idx_ro_email', ['email'], { unique: true })
@Index('idx_ro_assigned_county', ['assignedCountyId'])
@Index('idx_ro_status', ['status'])
@Index('idx_ro_level', ['level'])
export class ReturningOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'national_id', unique: true, length: 8 })
  nationalId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ name: 'preferred_county1' })
  preferredCounty1: string;

  @Column({ name: 'preferred_county2' })
  preferredCounty2: string;

  @Column({ name: 'assigned_county_id', nullable: true })
  assignedCountyId: string;

  @Column({ name: 'assigned_county_name', nullable: true })
  assignedCountyName: string;

  @Column({ default: 'county' })
  level: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', nullable: true })
  mfaSecret: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}