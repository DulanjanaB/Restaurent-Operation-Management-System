import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { StorageLocationType } from './storage-location-type.enum';

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: StorageLocationType })
  type: StorageLocationType;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  target_temp_min: string | null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  target_temp_max: string | null;
}
