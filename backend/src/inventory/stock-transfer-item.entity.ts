import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { Item } from './item.entity';

@Entity('stock_transfer_items')
export class StockTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  stock_transfer_id: string;

  @ManyToOne(() => StockTransfer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_transfer_id' })
  stock_transfer: StockTransfer;

  @Column('uuid')
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: string;
}
