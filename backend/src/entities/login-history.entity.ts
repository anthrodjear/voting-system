import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * LoginHistory Entity - User login attempt history
 * 
 * Database Optimization Notes:
 * - Index on user_id for特定用户的登录历史查询
 * - Index on created_at for日期范围查询
 * - 复合索引 on (user_id, created_at DESC) for用户最近的登录
 * - 建议使用BRIN索引优化登录历史表（按时间顺序插入）
 * - 归档策略: 将超过90天的old登录记录移到归档表
 */
@Entity('login_history')
@Index('idx_login_user', ['userId'])
@Index('idx_login_user_created', ['userId', 'createdAt'])
@Index('idx_login_created', ['createdAt'])
@Index('idx_login_user_type', ['userType'])
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ name: 'user_type', length: 20 })
  userType: string;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column()
  success: boolean;

  @Column({ name: 'failure_reason', length: 100, nullable: true })
  failureReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}