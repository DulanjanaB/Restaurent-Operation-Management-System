import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/user.entity';
import { RosterPeriodStatus, RosterPeriodType } from './roster-period.enums';

// "Weekly Roster" and "Monthly Roster" aren't separate tables — same shape,
// distinguished by period_type. See docs/roster-management-design.md.
@Entity('roster_periods')
export class RosterPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'enum', enum: RosterPeriodType })
  period_type: RosterPeriodType;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({
    type: 'enum',
    enum: RosterPeriodStatus,
    default: RosterPeriodStatus.DRAFT,
  })
  status: RosterPeriodStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @Column('uuid', { nullable: true })
  published_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'published_by' })
  published_by_user: User | null;
}
