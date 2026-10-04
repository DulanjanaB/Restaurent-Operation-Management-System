import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReceiveLineDto {
  @IsUUID()
  purchase_order_item_id: string;

  @IsNumberString()
  quantity_received: string;

  // Required if the item has track_expiry = true.
  @IsOptional()
  @IsString()
  batch_no?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}

export class ReceivePurchaseOrderDto {
  // Which of the branch's warehouses this delivery is unloaded into —
  // PurchaseOrder itself is only branch-scoped (per
  // docs/inventory-management-design.md), so the receiving warehouse has to
  // be chosen at receipt time, not baked into the order.
  @IsUUID()
  warehouse_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveLineDto)
  lines: ReceiveLineDto[];
}
