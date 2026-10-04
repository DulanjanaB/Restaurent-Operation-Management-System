import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/user.entity';
import { TipPoolStatus } from './tip-pool-status.enum';

// One per branch per day. `open` = participants/percentages still
// editable; `calculated` = amounts locked in. See
// docs/tip-sharing-design.md.
@Entity('tip_pools')
@Index(['branch_id', 'date'], { unique: true })
export class TipPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_amount: string;

  @Column({ type: 'enum', enum: TipPoolStatus, default: TipPoolStatus.OPEN })
  status: TipPoolStatus;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'timestamptz', nullable: true })
  calculated_at: Date | null;

  @Column('uuid', { nullable: true })
  calculated_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'calculated_by' })
  calculator: User | null;
}
