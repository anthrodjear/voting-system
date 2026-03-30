import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Constituency } from './constituency.entity';

@Entity('counties')
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

  @OneToMany(() => Constituency, (constituency) => constituency.county)
  constituencies: Constituency[];
}
