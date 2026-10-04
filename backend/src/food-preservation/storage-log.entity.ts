import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StorageLocation } from './storage-location.entity';
import { User } from '../users/user.entity';

// Covers both "Temperature Records" and "Storage Conditions" in one entry
// — a freezer check logs both at once. See
// docs/food-preservation-design.md.
@Entity('storage_logs')
export class StorageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  storage_location_id: string;

  @ManyToOne(() => StorageLocation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storage_location_id' })
  storage_location: StorageLocation;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  recorded_at: Date;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  temperature: string;

  @Column({ nullable: true })
  condition_notes: string;

  @Column('uuid')
  recorded_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recorder: User;

  // Computed at write time against the location's target range, so
  // out-of-range history doesn't depend on the target range never
  // changing later.
  @Column()
  in_range: boolean;
}
