import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global, not branch-scoped — a supplier can serve multiple branches. See
// docs/inventory-management-design.md.
@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  notes: string;
}
