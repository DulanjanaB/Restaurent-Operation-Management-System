import { IsOptional, IsString } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
