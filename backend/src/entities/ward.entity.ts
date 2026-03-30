import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Constituency } from './constituency.entity';

@Entity('wards')
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

  @ManyToOne(() => Constituency, (constituency) => constituency.wards)
  @JoinColumn({ name: 'constituency_id' })
  constituency: Constituency;
}
