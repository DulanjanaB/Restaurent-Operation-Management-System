import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePreservedItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  default_unit?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  inventory_item_id?: string;
}
