import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusType } from '../types/buses/enums.js';
import { BusCompany } from './bus-company.entity.js';

@Entity('buses')
@Check('"rows" > 0')
@Check('"columns" > 0')
export class Bus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne(() => BusCompany, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: BusCompany;

  @Column({ type: 'enum', enum: BusType, enumName: 'bus_type' })
  type: BusType;

  @Column({ type: 'int' })
  rows: number;

  @Column({ type: 'int' })
  columns: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
