import { IsEnum, IsNumberString, IsUUID } from 'class-validator';
import { WastageReason } from '../wastage.enums';

export class CreateWastageDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  warehouse_id: string;

  @IsNumberString()
  quantity: string;

  @IsEnum(WastageReason)
  reason: WastageReason;
}
