import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global catalog — same "Chicken Stock" entry regardless of branch; what's
// branch-scoped is each Batch of it. See docs/food-preservation-design.md.
@Entity('preserved_items')
export class PreservedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Short code used in batch numbers, e.g. "CHK" for Chicken Stock.
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  default_unit: string;

  @Column({ nullable: true })
  category: string;

  // Unset until the Inventory module's item this maps to is decided — see
  // docs/food-preservation-design.md#future-inventory-link.
  @Column('uuid', { nullable: true })
  inventory_item_id: string | null;
}
