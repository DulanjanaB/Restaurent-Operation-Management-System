import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Employee } from '../roster/employee.entity';

@Entity('event_staff_assignments')
@Index(['event_id', 'staff_id'], { unique: true })
export class EventStaffAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  event_id: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column('uuid')
  staff_id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Employee;

  @Column()
  role_in_event: string;
}
