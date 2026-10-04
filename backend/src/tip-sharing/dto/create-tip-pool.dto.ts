import { IsDateString, IsNumberString, IsUUID } from 'class-validator';

export class CreateTipPoolDto {
  @IsUUID()
  branch_id: string;

  @IsDateString()
  date: string;

  @IsNumberString()
  total_amount: string;
}
