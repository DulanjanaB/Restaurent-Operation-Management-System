import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shift } from './shift.entity';
import { Employee } from './employee.entity';
import { Position } from './position.entity';
import { ShiftAssignmentStatus } from './shift-assignment.enum';

@Entity('shift_assignments')
export class ShiftAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  shift_id: string;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Role for THIS shift — may differ from the employee's default position
  // (cross-trained staff). See docs/roster-management-design.md.
  @Column('uuid')
  position_id: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({
    type: 'enum',
    enum: ShiftAssignmentStatus,
    default: ShiftAssignmentStatus.ASSIGNED,
  })
  status: ShiftAssignmentStatus;
}
