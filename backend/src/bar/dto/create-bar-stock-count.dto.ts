import { IsDateString, IsNumberString, IsUUID } from 'class-validator';

export class CreateBarStockCountDto {
  @IsUUID()
  warehouse_id: string;

  @IsUUID()
  item_id: string;

  @IsNumberString()
  counted_quantity: string;

  @IsDateString()
  counted_at: string;
}
