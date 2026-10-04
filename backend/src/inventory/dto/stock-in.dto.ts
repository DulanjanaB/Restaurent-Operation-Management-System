import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class StockInDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  warehouse_id: string;

  @IsNumberString()
  quantity: string;

  // Required when the item has track_expiry = true.
  @IsOptional()
  @IsString()
  batch_no?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}
