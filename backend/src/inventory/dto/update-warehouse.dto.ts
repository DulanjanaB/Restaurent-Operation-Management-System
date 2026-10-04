import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WarehouseType } from '../warehouse-type.enum';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;
}
