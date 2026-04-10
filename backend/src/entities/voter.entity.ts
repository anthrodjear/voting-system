import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { County } from './county.entity';
import { Constituency } from './constituency.entity';
import { Ward } from './ward.entity';
import { VoterBiometric } from './voter-biometric.entity';

/**
 * Voter Entity - Registered voter information
 * 
 * Database Optimization Notes:
 * - Index on national_id (unique constraint automatically creates btree index)
 * - Composite index on (county_id, is_active) for county-level voter queries
 * - Index on status for快速pending验证查询
 * - Index on registered_at for注册日期范围查询
 * - Partitioning建议: 按election_id分区votes表，但voters表可以按county_id分区
 * - 建议使用表大学生成voters表的州/区级统计视图
 */
@Entity('voters')
@Index('idx_voters_county', ['countyId'])
@Index('idx_voters_constituency', ['constituencyId'])
@Index('idx_voters_ward', ['wardId'])
@Index('idx_voters_status', ['status'])
@Index('idx_voters_registered', ['registeredAt'])
@Index('idx_voters_national_id_verified', ['nationalIdVerified'])
export class Voter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'national_id', unique: true, length: 8 })
  nationalId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ name: 'county_id', nullable: true })
  countyId: string;

  @Column({ name: 'county_name', nullable: true })
  countyName: string;

  @Column({ name: 'constituency_id', nullable: true })
  constituencyId: string;

  @Column({ name: 'constituency_name', nullable: true })
  constituencyName: string;

  @Column({ name: 'ward_id', nullable: true })
  wardId: string;

  @Column({ name: 'ward_name', nullable: true })
  wardName: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'registration_status', default: 'pending' })
  registrationStatus: string;

  @Column({ name: 'national_id_verified', default: false })
  nationalIdVerified: boolean;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'password_changed_at', nullable: true })
  passwordChangedAt: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_at', nullable: true })
  lockedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'registered_at', nullable: true })
  registeredAt: Date;

  /**
   * Relationship: Voter belongs to one County (optional)
   * Foreign Key: county_id references counties(id)
   */
  @ManyToOne(() => County, { nullable: true })
  @JoinColumn({ name: 'county_id' })
  county: County;

  /**
   * Relationship: Voter belongs to one Constituency (optional)
   */
  @ManyToOne(() => Constituency, { nullable: true })
  @JoinColumn({ name: 'constituency_id' })
  constituency: Constituency;

  /**
   * Relationship: Voter belongs to one Ward (optional)
   */
  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  /**
   * Relationship: One Voter hasOne VoterBiometric
   * Cascade: cascade biometric data on voter creation
   */
  @OneToOne(() => VoterBiometric, (biometric) => biometric.voter, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  biometric: VoterBiometric;
}