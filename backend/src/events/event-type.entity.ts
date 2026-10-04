import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global lookup — shared category list across the whole business. See
// docs/event-management-design.md.
@Entity('event_types')
export class EventType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
