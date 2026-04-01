import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Constituency } from './constituency.entity';

/**
 * County Entity - Top-level administrative division in Kenya
 * 
 * Database Optimization Notes:
 * - Index on county_code (unique constraint automatically creates btree index)
 * - Consider partitioning by region for large-scale queries
 * - Partial index on is_active = true for快速的活跃县查询
 */
@Entity('counties')
@Index('idx_counties_region', ['region'])
@Index('idx_counties_active', ['isActive'])
export class County {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'county_code', unique: true, length: 10 })
  countyCode: string;

  @Column({ name: 'county_name', unique: true, length: 100 })
  countyName: string;

  @Column({ length: 100 })
  region: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ name: 'area_sq_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaSqKm: number;

  @Column({ nullable: true })
  population: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Relationship: One County hasMany Constituencies
   * Cascade: cascadeConstituencies on insert/update for data integrity
   */
  @OneToMany(() => Constituency, (constituency) => constituency.county, {
    cascade: ['insert', 'update'],
  })
  constituencies: Constituency[];
}