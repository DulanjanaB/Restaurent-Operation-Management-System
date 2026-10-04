import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistRecord } from './checklist-record.entity';
import { ChecklistItem } from './checklist-item.entity';
import { User } from '../users/user.entity';
import { Auditable } from '../audit-log/auditable.decorator';

// The tick. Unique per (record, item) — answering again overwrites (a
// correction), it doesn't duplicate. See docs/checklist-design.md.
@Auditable()
@Entity('checklist_record_responses')
@Index(['checklist_record_id', 'checklist_item_id'], { unique: true })
export class ChecklistRecordResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  checklist_record_id: string;

  @ManyToOne(() => ChecklistRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_record_id' })
  checklist_record: ChecklistRecord;

  @Column('uuid')
  checklist_item_id: string;

  @ManyToOne(() => ChecklistItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_item_id' })
  checklist_item: ChecklistItem;

  @Column()
  answer: boolean;

  // Required if answer = false and the item's requires_reason_on_no.
  @Column('varchar', { nullable: true })
  reason: string | null;

  @Column('uuid')
  answered_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'answered_by' })
  answerer: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  answered_at: Date;
}
