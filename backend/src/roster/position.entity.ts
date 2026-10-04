import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Global, not branch-scoped — job titles are standard labels regardless of
// branch. See docs/roster-management-design.md.
@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
