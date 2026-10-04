import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { StorageLocationType } from '../storage-location-type.enum';

export class UpdateStorageLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(StorageLocationType)
  type?: StorageLocationType;

  @IsOptional()
  @IsNumberString()
  target_temp_min?: string;

  @IsOptional()
  @IsNumberString()
  target_temp_max?: string;
}
