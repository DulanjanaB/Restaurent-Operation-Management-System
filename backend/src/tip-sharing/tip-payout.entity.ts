import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from '../roster/employee.entity';
import { User } from '../users/user.entity';

// A clearing event — cash handed over to one employee. Sets
// TipAllocation.tip_payout_id on every currently-unpaid allocation for
// that employee. See docs/tip-sharing-design.md.
@Entity('tip_payouts')
export class TipPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  paid_at: Date;

  @Column('uuid')
  paid_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paid_by' })
  payer: User;

  @Column({ nullable: true })
  notes: string;
}
