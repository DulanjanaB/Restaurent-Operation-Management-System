import { IsNumberString } from 'class-validator';

export class UpdateTipPoolDto {
  @IsNumberString()
  total_amount: string;
}
