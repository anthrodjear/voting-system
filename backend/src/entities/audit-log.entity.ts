import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AuditLog Entity - Comprehensive audit trail for all system actions
 * 
 * Database Optimization Notes (Critical for compliance and security):
 * - Index on user_id for特定用户的操作审计
 * - Index on action for操作类型筛选
 * - Index on resource for资源类型筛选  
 * - Index on created_at for日期范围查询 (最常用的查询模式)
 * - 复合索引 on (user_id, created_at DESC) for用户最近操作
 * - 使用 BRIN 索引 (PostgreSQL 14+): CREATE INDEX USING BRIN (created_at)
 * 
 * GDPR/Compliance Notes:
 * - 此表存储敏感操作记录,需要考虑数据保护
 * - 建议加密存储 sensitive columns (old_value, new_value)
 * - 归档策略: 将超过2年的审计记录转移到冷存储
 */
@Entity('audit_logs')
@Index('idx_audit_user', ['userId'])
@Index('idx_audit_user_created', ['userId', 'createdAt'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_resource', ['resource'])
@Index('idx_audit_resource_id', ['resourceId'])
@Index('idx_audit_created', ['createdAt'])
@Index('idx_audit_status', ['status'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ name: 'user_role', length: 20 })
  userRole: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ name: 'resource_id', length: 100, nullable: true })
  resourceId: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: any;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ default: 'success' })
  status: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}