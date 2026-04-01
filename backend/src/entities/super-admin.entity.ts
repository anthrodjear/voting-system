import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * SuperAdmin Entity - System administrators with elevated privileges
 * 
 * Database Optimization Notes:
 * - Index on email (unique constraint automatically creates btree index)
 * - Index on is_active for管理员状态查询
 */
@Entity('super_admins')
@Index('idx_superadmin_email', ['email'], { unique: true })
@Index('idx_superadmin_active', ['isActive'])
export class SuperAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ default: 'admin' })
  level: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', nullable: true })
  mfaSecret: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}