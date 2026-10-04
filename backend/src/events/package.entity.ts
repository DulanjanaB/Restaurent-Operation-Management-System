import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';

@Entity('event_packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  price_per_guest: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  flat_price: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;
}
