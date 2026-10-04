import {
  ArrayMinSize,
  IsArray,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemRequestLineDto {
  @IsUUID()
  item_id: string;

  @IsNumberString()
  quantity: string;
}

export class CreateItemRequestDto {
  @IsUUID()
  warehouse_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemRequestLineDto)
  items: ItemRequestLineDto[];
}
