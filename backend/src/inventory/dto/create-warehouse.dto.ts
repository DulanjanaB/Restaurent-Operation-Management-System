import { IsEnum, IsString, IsUUID } from 'class-validator';
import { WarehouseType } from '../warehouse-type.enum';

export class CreateWarehouseDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @IsEnum(WarehouseType)
  type: WarehouseType;
}
