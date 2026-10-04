import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';

// One row per item x warehouse — the current balance. Never updated
// directly; every change flows through a StockMovement. `status`
// ("Available"/"Low Stock"/"Out of Stock") isn't stored — computed from
// quantity vs. minimum_stock_level. See docs/inventory-management-design.md.
@Entity('stock')
export class Stock {
  @PrimaryColumn('uuid')
  item_id: string;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @PrimaryColumn('uuid')
  warehouse_id: string;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'numeric', precision: 14, scale: 3, default: 0 })
  quantity: string;

  @Column({ type: 'numeric', precision: 14, scale: 3, default: 0 })
  minimum_stock_level: string;
}
