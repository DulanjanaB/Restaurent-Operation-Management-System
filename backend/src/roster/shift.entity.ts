import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RosterPeriod } from './roster-period.entity';
import { ShiftTemplate } from './shift-template.entity';
import { Department } from './department.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  roster_period_id: string;

  @ManyToOne(() => RosterPeriod, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roster_period_id' })
  roster_period: RosterPeriod;

  @Column('uuid', { nullable: true })
  shift_template_id: string | null;

  @ManyToOne(() => ShiftTemplate, { nullable: true })
  @JoinColumn({ name: 'shift_template_id' })
  shift_template: ShiftTemplate | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column('uuid', { nullable: true })
  department_id: string | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;
}
