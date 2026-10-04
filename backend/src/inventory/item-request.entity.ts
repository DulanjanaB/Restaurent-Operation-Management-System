import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { User } from '../users/user.entity';
import { ItemRequestItem } from './item-request-item.entity';
import { ItemRequestStatus } from './item-request.enum';

@Entity('inventory_item_requests')
export class ItemRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: ItemRequestStatus,
    default: ItemRequestStatus.PENDING,
  })
  status: ItemRequestStatus;

  @Column('uuid')
  requested_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column('uuid', { nullable: true })
  decided_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'decided_by' })
  decider: User | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ItemRequestItem, (line) => line.item_request, {
    cascade: true,
  })
  items: ItemRequestItem[];
}
