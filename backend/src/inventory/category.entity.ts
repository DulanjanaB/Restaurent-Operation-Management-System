import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory_categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
