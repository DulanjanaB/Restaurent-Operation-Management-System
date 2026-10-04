import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { StorageLocationType } from '../storage-location-type.enum';

export class CreateStorageLocationDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @IsEnum(StorageLocationType)
  type: StorageLocationType;

  @IsOptional()
  @IsNumberString()
  target_temp_min?: string;

  @IsOptional()
  @IsNumberString()
  target_temp_max?: string;
}
