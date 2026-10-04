import { IsOptional, IsString } from 'class-validator';

export class PayoutDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
