import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class LogStorageDto {
  @IsNumberString()
  temperature: string;

  @IsOptional()
  @IsString()
  condition_notes?: string;
}
