import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { ShiftAssignment } from './shift-assignment.entity';
import { AttendanceStatus } from './attendance.enum';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employee_id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column('uuid', { nullable: true })
  shift_assignment_id: string | null;

  @ManyToOne(() => ShiftAssignment, { nullable: true })
  @JoinColumn({ name: 'shift_assignment_id' })
  shift_assignment: ShiftAssignment | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'timestamptz', nullable: true })
  clock_in: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  clock_out: Date | null;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;
}
