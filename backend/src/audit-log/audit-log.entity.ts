import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nullable for system-triggered changes (e.g. the automatic
  // active -> expired batch transition).
  @Column('uuid', { nullable: true })
  actor_id: string | null;

  // Snapshot at write time — stays readable even if the User is later
  // deleted.
  @Column('varchar', { nullable: true })
  actor_name: string | null;

  // 'create' / 'update' / 'delete' for plain field edits, or a specific
  // permission-key-style action when one applied, e.g.
  // 'inventory.stock_adjustment'.
  @Column()
  action: string;

  @Column()
  entity_type: string;

  // Nullable for non-entity events (login, report export).
  @Column('uuid', { nullable: true })
  entity_id: string | null;

  @Column('varchar', { nullable: true })
  entity_label: string | null;

  // { field: { old, new } } — null for non-mutation events.
  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, { old: unknown; new: unknown }> | null;

  @Column('uuid', { nullable: true })
  branch_id: string | null;

  @Column('varchar', { nullable: true })
  ip_address: string | null;

  @Column('varchar', { nullable: true })
  user_agent: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
