import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { WarehouseType } from './warehouse-type.enum';

// Matches the "Restaurant -> Main Store / Kitchen Store / Bar Store /
// Freezer" diagram in docs/inventory-management-design.md — each branch has
// multiple stores.
@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: WarehouseType })
  type: WarehouseType;
}
