import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { County } from './county.entity';
import { Ward } from './ward.entity';

@Entity('constituencies')
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

  @ManyToOne(() => County, (county) => county.constituencies)
  @JoinColumn({ name: 'county_id' })
  county: County;

  @OneToMany(() => Ward, (ward) => ward.constituency)
  wards: Ward[];
}
