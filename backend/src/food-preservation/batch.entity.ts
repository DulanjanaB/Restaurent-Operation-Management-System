import { dayColorFor } from './batch-day-colors';
import { Auditable } from '../audit-log/auditable.decorator';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from '../roster/employee.entity';
import { PreservedItem } from './preserved-item.entity';
import { StorageLocation } from './storage-location.entity';
import { User } from '../users/user.entity';
import { BatchStatus } from './batch-status.enum';

@Auditable()
@Entity('food_preservation_batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. CHK-2026-001 — {PreservedItem.code}-{year}-{sequence}
  @Column({ unique: true })
  batch_code: string;

  @Column('uuid')
  preserved_item_id: string;

  @ManyToOne(() => PreservedItem)
  @JoinColumn({ name: 'preserved_item_id' })
  preserved_item: PreservedItem;

  @Column('uuid')
  storage_location_id: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'storage_location_id' })
  storage_location: StorageLocation;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  @Column()
  unit: string;

  @Column({ type: 'date' })
  production_date: string;

  // Derived from production_date on every load — not a stored column.
  production_day?: string;
  day_color?: { name: string; hex: string };

  @AfterLoad()
  computeDayColor() {
    if (!this.production_date) return;
    const day = dayColorFor(this.production_date);
    this.production_day = day.day;
    this.day_color = { name: day.color, hex: day.hex };
  }

  @Column({ type: 'date' })
  expiry_date: string;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.ACTIVE })
  status: BatchStatus;

  @Column('uuid')
  produced_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'produced_by' })
  producer: User;

  @Column({ nullable: true })
  notes: string;

  // Everyone who prepared the batch — at least one, see CreateBatchDto.
  @ManyToMany(() => Employee)
  @JoinTable({
    name: 'batch_preparers',
    joinColumn: { name: 'batch_id' },
    inverseJoinColumn: { name: 'employee_id' },
  })
  preparers: Employee[];
}
