import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../inventory/warehouse.entity';
import { Item } from '../inventory/item.entity';
import { User } from '../users/user.entity';

@Entity('bar_stock_counts')
export class BarStockCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  counted_quantity: string;

  @Column({ type: 'date' })
  counted_at: string;

  @Column('uuid')
  counted_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'counted_by' })
  counter: User;
}
