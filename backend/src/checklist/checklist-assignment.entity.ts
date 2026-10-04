import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';
import { Employee } from '../roster/employee.entity';
import { User } from '../users/user.entity';
import { Auditable } from '../audit-log/auditable.decorator';

@Auditable()
@Entity('checklist_assignments')
export class ChecklistAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  checklist_template_id: string;

  @ManyToOne(() => ChecklistTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_template_id' })
  checklist_template: ChecklistTemplate;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column('uuid')
  assigned_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;
}
