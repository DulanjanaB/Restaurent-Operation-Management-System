import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Item } from './item.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  purchase_order_id: string;

  @ManyToOne(() => PurchaseOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchase_order: PurchaseOrder;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity_ordered: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: string;

  // Cumulative, updated as deliveries arrive — see
  // docs/inventory-management-design.md's Procurement section.
  @Column({ type: 'numeric', precision: 14, scale: 3, default: 0 })
  quantity_received: string;
}
