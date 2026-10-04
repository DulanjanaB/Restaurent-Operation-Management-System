import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global, not branch-scoped — a client may book events at different
// branches; their history should follow them. See
// docs/event-management-design.md.
@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  notes: string;
}
