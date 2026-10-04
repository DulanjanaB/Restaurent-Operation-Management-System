import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsUUID()
  category_id: string;

  @IsUUID()
  unit_id: string;

  @IsOptional()
  @IsBoolean()
  track_expiry?: boolean;

  @IsOptional()
  @IsNumberString()
  base_unit_quantity?: string;
}
