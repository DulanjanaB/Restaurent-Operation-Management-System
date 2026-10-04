import {
  ArrayMinSize,
  IsArray,
  IsNumberString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StockTransferLineDto {
  @IsUUID()
  item_id: string;

  @IsNumberString()
  quantity: string;
}

export class CreateStockTransferDto {
  @IsUUID()
  from_warehouse_id: string;

  @IsUUID()
  to_warehouse_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  items: StockTransferLineDto[];
}
