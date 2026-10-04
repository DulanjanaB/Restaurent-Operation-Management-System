import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

// Global catalog — same "Chicken Breast" item, stock tracked separately per
// warehouse via Stock. See docs/inventory-management-design.md.
@Entity('inventory_items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column('uuid')
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('uuid')
  unit_id: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  // If true, stock for this item is tracked in StockBatch lots with expiry
  // dates rather than just a running Stock total.
  @Column({ default: false })
  track_expiry: boolean;

  // How many of a smaller measurement unit one stock unit equals — e.g.
  // 750 for a bottle stocked in `unit_id: bottle` but portioned in ml by
  // recipes. Null means the stock unit itself is the portioning unit (no
  // conversion needed). See docs/bar-management-design.md#unit-conversion-note.
  @Column({ type: 'numeric', precision: 12, scale: 3, nullable: true })
  base_unit_quantity: string | null;
}
