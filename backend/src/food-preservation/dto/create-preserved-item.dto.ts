import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePreservedItemDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  default_unit: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  inventory_item_id?: string;
}
