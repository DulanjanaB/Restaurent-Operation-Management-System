import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistAssignment } from './checklist-assignment.entity';
import { ChecklistTemplate } from './checklist-template.entity';
import { Employee } from '../roster/employee.entity';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/user.entity';
import { ChecklistRecordStatus } from './checklist-record-status.enum';

// One day's instance — the "sheet." Lazily generated on read (see
// ChecklistRecordsService), not by a scheduled job. Not itself
// @Auditable() — its status flip is a side effect of ChecklistRecordResponse
// writes, which are already captured. See docs/checklist-design.md.
@Entity('checklist_records')
@Index(['checklist_assignment_id', 'date'], { unique: true })
export class ChecklistRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  checklist_assignment_id: string;

  @ManyToOne(() => ChecklistAssignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_assignment_id' })
  checklist_assignment: ChecklistAssignment;

  // Snapshots — survive the assignment/template changing later.
  @Column('uuid')
  checklist_template_id: string;

  @ManyToOne(() => ChecklistTemplate)
  @JoinColumn({ name: 'checklist_template_id' })
  checklist_template: ChecklistTemplate;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: ChecklistRecordStatus,
    default: ChecklistRecordStatus.PENDING,
  })
  status: ChecklistRecordStatus;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @Column('uuid', { nullable: true })
  completed_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completer: User | null;
}
