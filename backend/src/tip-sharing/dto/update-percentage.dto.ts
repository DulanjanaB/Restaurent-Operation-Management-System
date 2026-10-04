import { IsNumberString } from 'class-validator';

export class UpdatePercentageDto {
  @IsNumberString()
  percentage: string;
}
