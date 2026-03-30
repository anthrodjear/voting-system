import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { County } from './county.entity';
import { Constituency } from './constituency.entity';
import { Ward } from './ward.entity';
import { VoterBiometric } from './voter-biometric.entity';

@Entity('voters')
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

  @ManyToOne(() => County, { nullable: true })
  @JoinColumn({ name: 'county_id' })
  county: County;

  @ManyToOne(() => Constituency, { nullable: true })
  @JoinColumn({ name: 'constituency_id' })
  constituency: Constituency;

  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  @OneToOne(() => VoterBiometric, (biometric) => biometric.voter)
  biometric: VoterBiometric;
}
