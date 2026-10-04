import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bar_recipes')
export class BarRecipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  selling_price: string;
}
