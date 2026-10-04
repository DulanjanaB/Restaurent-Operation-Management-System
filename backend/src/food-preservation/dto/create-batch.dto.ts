import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBatchDto {
  @IsUUID()
  preserved_item_id: string;

  @IsUUID()
  storage_location_id: string;

  @IsNumberString()
  quantity: string;

  @IsDateString()
  production_date: string;

  @IsDateString()
  expiry_date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  prepared_by_ids: string[];
}
