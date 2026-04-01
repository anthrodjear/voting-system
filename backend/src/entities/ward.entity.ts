import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Constituency } from './constituency.entity';

/**
 * Ward Entity - Third-level administrative division (smallest electoral unit)
 * 
 * Database Optimization Notes:
 * - Index on ward_code (unique constraint automatically creates btree index)
 * - FK index on constituency_id already created by ManyToOne relationship
 * - Materialized view建议for快速ward-level election results聚合查询
 */
@Entity('wards')
@Index('idx_wards_constituency', ['constituencyId'])
@Index('idx_wards_active', ['isActive'])
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'constituency_id' })
  constituencyId: string;

  @Column({ name: 'ward_code', unique: true, length: 10 })
  wardCode: string;

  @Column({ name: 'ward_name', length: 100 })
  wardName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Relationship: Many Wards belong to One Constituency
   * Foreign Key: constituency_id references constituencies(id)
   */
  @ManyToOne(() => Constituency, (constituency) => constituency.wards, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'constituency_id' })
  constituency: Constituency;
}