import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../audit-log/auditable.decorator';

// Single key-value store rather than one table per category — new
// categories (notifications, email, backup, audit) can be added later as
// just a new `category` value, no schema change. See
// docs/settings-design.md.
@Auditable()
@Entity('settings')
@Index(['category', 'key'], { unique: true })
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  key: string;

  // Scalar or object — one shape handles both.
  @Column({ type: 'jsonb' })
  value: unknown;

  @Column('uuid')
  updated_by: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
