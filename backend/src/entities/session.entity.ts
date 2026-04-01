import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Session Entity - User session management for JWT tokens
 * 
 * Database Optimization Notes:
 * - Index on user_id for快速查找用户的所有会话
 * - Index on expires_at for清理过期会话
 * - Index on token_hash for会话验证
 * - 建议使用表大学生成每个用户的活跃会话数视图
 * - 定期归档/清理超过30天的old会话以优化性能
 */
@Entity('sessions')
@Index('idx_sessions_user', ['userId'])
@Index('idx_sessions_expires', ['expiresAt'])
@Index('idx_sessions_token', ['tokenHash'])
@Index('idx_sessions_user_type', ['userId', 'userType'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'user_type' })
  userType: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;
}