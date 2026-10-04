import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';

// Only for items with track_expiry = true — lets perishable raw stock (a
// delivery of chicken breast) carry its own expiry, independent of what it
// becomes once cooked (see docs/food-preservation-design.md's future link).
@Entity('stock_batches')
export class StockBatch {
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

  @Column()
  batch_no: string;

  // Remaining quantity in this lot.
  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: string;

  @Column({ type: 'date' })
  expiry_date: string;

  @Column({ type: 'date' })
  received_at: string;
}
