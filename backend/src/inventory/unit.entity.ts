import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory_units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  abbreviation: string;
}
