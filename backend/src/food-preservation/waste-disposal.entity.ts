import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { Auditable } from '../audit-log/auditable.decorator';
import { User } from '../users/user.entity';
import {
  WasteDisposalReason,
  WasteDisposalStatus,
} from './waste-disposal.enums';

@Auditable()
@Entity('food_preservation_waste_disposals')
export class WasteDisposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  batch_id: string;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  @Column({ type: 'enum', enum: WasteDisposalReason })
  reason: WasteDisposalReason;

  @Column({
    type: 'enum',
    enum: WasteDisposalStatus,
    default: WasteDisposalStatus.PENDING,
  })
  status: WasteDisposalStatus;

  @Column('uuid')
  requested_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column('uuid', { nullable: true })
  approved_by: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  disposed_at: Date | null;
}
