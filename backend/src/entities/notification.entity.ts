import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
@Index('idx_notifications_user', ['userId', 'isRead'])
@Index('idx_notifications_created', ['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('idx_notifications_user_id')
  userId: string;

  @Column({ name: 'user_role', length: 30 })
  userRole: string;

  @Column({ length: 20 })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'action_url', nullable: true })
  actionUrl: string;

  @Column({ name: 'icon', length: 30, nullable: true })
  icon: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'related_resource', length: 50, nullable: true })
  relatedResource: string;

  @Column({ name: 'related_resource_id', nullable: true })
  relatedResourceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
