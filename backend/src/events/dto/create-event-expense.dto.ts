import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventExpenseDto {
  @IsString()
  category: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  incurred_at: string;
}
