import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "inventory.stock_adjustment", "administration.user.reset_password"
  @Column({ unique: true })
  key: string;

  @Column()
  module: string;

  @Column({ nullable: true })
  resource: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description: string;
}
