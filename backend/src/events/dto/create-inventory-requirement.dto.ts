import { IsNumberString, IsUUID } from 'class-validator';

export class CreateInventoryRequirementDto {
  @IsUUID()
  inventory_item_id: string;

  @IsNumberString()
  quantity_required: string;
}
