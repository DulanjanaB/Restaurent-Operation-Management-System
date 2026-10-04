import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Item } from '../inventory/item.entity';

@Entity('event_inventory_requirements')
export class EventInventoryRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  event_id: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column('uuid')
  inventory_item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'inventory_item_id' })
  inventory_item: Item;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity_required: string;

  @Column({ type: 'numeric', precision: 14, scale: 3, default: 0 })
  quantity_issued: string;
}
