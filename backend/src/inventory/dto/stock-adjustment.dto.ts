import { IsNumberString, IsUUID } from 'class-validator';

export class StockAdjustmentDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  warehouse_id: string;

  // The corrected count, not a delta.
  @IsNumberString()
  new_quantity: string;
}
