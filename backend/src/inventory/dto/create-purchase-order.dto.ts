import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseOrderLineDto {
  @IsUUID()
  item_id: string;

  @IsNumberString()
  quantity_ordered: string;

  @IsNumberString()
  unit_price: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  branch_id: string;

  @IsUUID()
  supplier_id: string;

  @IsDateString()
  order_date: string;

  @IsOptional()
  @IsDateString()
  expected_date?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  items: PurchaseOrderLineDto[];
}
