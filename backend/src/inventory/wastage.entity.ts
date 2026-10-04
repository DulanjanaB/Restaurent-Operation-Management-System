import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';
import { User } from '../users/user.entity';
import { WastageReason, WastageStatus } from './wastage.enums';

@Entity('inventory_wastages')
export class Wastage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column('uuid')
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: string;

  @Column({ type: 'enum', enum: WastageReason })
  reason: WastageReason;

  @Column({ type: 'enum', enum: WastageStatus, default: WastageStatus.PENDING })
  status: WastageStatus;

  @Column('uuid')
  requested_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column('uuid', { nullable: true })
  approved_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;
}
