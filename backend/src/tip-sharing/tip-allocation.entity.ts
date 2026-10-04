import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipPool } from './tip-pool.entity';
import { Employee } from '../roster/employee.entity';
import { TipPayout } from './tip-payout.entity';

// One row per participating employee per pool — both "who's in" and "what
// they got." `amount` is null while the pool is still `open`.
// `tip_payout_id` is null while unpaid. See docs/tip-sharing-design.md.
@Entity('tip_allocations')
@Index(['tip_pool_id', 'employee_id'], { unique: true })
export class TipAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tip_pool_id: string;

  @ManyToOne(() => TipPool, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tip_pool_id' })
  tip_pool: TipPool;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 100 })
  percentage: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amount: string | null;

  @Column('uuid', { nullable: true })
  tip_payout_id: string | null;

  @ManyToOne(() => TipPayout, { nullable: true })
  @JoinColumn({ name: 'tip_payout_id' })
  tip_payout: TipPayout | null;
}
