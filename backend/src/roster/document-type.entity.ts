import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global lookup, not a hardcoded enum — new document types get added as a
// row, not a migration. See docs/roster-management-design.md.
@Entity('document_types')
export class DocumentType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  requires_expiry: boolean;
}
