import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemRequest } from './item-request.entity';
import { Item } from './item.entity';

@Entity('inventory_item_request_items')
export class ItemRequestItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  item_request_id: string;

  @ManyToOne(() => ItemRequest, (request) => request.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_request_id' })
  item_request: ItemRequest;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: string;
}
