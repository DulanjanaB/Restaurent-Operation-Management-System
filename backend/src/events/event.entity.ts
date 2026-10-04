import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { EventType } from './event-type.entity';
import { Customer } from './customer.entity';
import { Venue } from './venue.entity';
import { Package } from './package.entity';
import { User } from '../users/user.entity';
import { EventStatus } from './event-status.enum';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column('uuid')
  event_type_id: string;

  @ManyToOne(() => EventType)
  @JoinColumn({ name: 'event_type_id' })
  event_type: EventType;

  @Column('uuid')
  customer_id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column('uuid')
  venue_id: string;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  // Set once the menu is chosen — see docs/event-management-design.md's
  // status pipeline (package_id being set is part of the "confirmed"
  // progress checklist, not a separate stored status).
  @Column('uuid', { nullable: true })
  package_id: string | null;

  @ManyToOne(() => Package, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package: Package | null;

  @Column({ type: 'timestamptz' })
  event_date: Date;

  @Column('int')
  guest_count: number;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.REQUESTED })
  status: EventStatus;

  // Negotiated pricing override — see docs/event-management-design.md#costrevenue.
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  revenue_override: string | null;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
