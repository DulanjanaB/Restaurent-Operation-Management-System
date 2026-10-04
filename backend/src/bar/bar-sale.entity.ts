import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../inventory/warehouse.entity';
import { BarRecipe } from './bar-recipe.entity';
import { User } from '../users/user.entity';

@Entity('bar_sales')
export class BarSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column('uuid')
  recipe_id: string;

  @ManyToOne(() => BarRecipe)
  @JoinColumn({ name: 'recipe_id' })
  recipe: BarRecipe;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  // Snapshot of BarRecipe.selling_price at sale time.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_amount: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sold_at: Date;

  @Column('uuid')
  sold_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sold_by' })
  seller: User;
}
