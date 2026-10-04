import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';
import { StockBatch } from './stock-batch.entity';
import { User } from '../users/user.entity';
import { StockMovementType } from './stock-movement.enum';

// The single ledger behind Stock In/Out/Adjustment/Transfer/Wastage — one
// shape instead of four separate tables. Stock.quantity is never updated
// directly; every row here is what moves it. See
// docs/inventory-management-design.md.
@Entity('stock_movements')
export class StockMovement {
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

  @Column('uuid', { nullable: true })
  stock_batch_id: string | null;

  @ManyToOne(() => StockBatch, { nullable: true })
  @JoinColumn({ name: 'stock_batch_id' })
  stock_batch: StockBatch | null;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: string;

  @Column({ nullable: true })
  reference_type: string;

  @Column('uuid', { nullable: true })
  reference_id: string | null;

  @Column('uuid')
  performed_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  occurred_at: Date;
}
