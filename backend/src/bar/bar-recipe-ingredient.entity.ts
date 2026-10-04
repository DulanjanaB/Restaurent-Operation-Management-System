import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BarRecipe } from './bar-recipe.entity';
import { Item } from '../inventory/item.entity';
import { Unit } from '../inventory/unit.entity';

@Entity('bar_recipe_ingredients')
export class BarRecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  recipe_id: string;

  @ManyToOne(() => BarRecipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: BarRecipe;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  // e.g. 30 (as in "30ml") — may be in a smaller unit than the item's
  // stock unit; see Item.base_unit_quantity for the conversion.
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity_per_serving: string;

  @Column('uuid')
  unit_id: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;
}
