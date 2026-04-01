import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { County } from './county.entity';
import { Ward } from './ward.entity';

/**
 * Constituency Entity - Second-level administrative division
 * 
 * Database Optimization Notes:
 * - Index on constituency_code (unique constraint automatically creates btree index)
 * - Composite index on (county_id, is_active) for county-level queries
 * - FK index on county_id already created by ManyToOne relationship
 */
@Entity('constituencies')
@Index('idx_constituencies_county', ['countyId'])
@Index('idx_constituencies_active', ['isActive'])
export class Constituency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'county_id' })
  countyId: string;

  @Column({ name: 'constituency_code', unique: true, length: 10 })
  constituencyCode: string;

  @Column({ name: 'constituency_name', length: 100 })
  constituencyName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Relationship: Many Constituencies belong to One County
   * Foreign Key: county_id references counties(id)
   */
  @ManyToOne(() => County, (county) => county.constituencies, {
    onDelete: 'RESTRICT', // Prevent deletion of county with existing constituencies
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'county_id' })
  county: County;

  /**
   * Relationship: One Constituency hasMany Wards
   */
  @OneToMany(() => Ward, (ward) => ward.constituency, {
    cascade: ['insert', 'update'],
  })
  wards: Ward[];
}