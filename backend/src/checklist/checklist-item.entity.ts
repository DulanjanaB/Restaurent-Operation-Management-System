import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';
import { Auditable } from '../audit-log/auditable.decorator';

@Auditable()
@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  checklist_template_id: string;

  @ManyToOne(() => ChecklistTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_template_id' })
  checklist_template: ChecklistTemplate;

  @Column('int')
  sequence: number;

  @Column()
  label: string;

  @Column({ default: true })
  requires_reason_on_no: boolean;
}
