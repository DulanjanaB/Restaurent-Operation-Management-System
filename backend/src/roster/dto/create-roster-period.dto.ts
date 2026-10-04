import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { RosterPeriodType } from '../roster-period.enums';

export class CreateRosterPeriodDto {
  @IsUUID()
  branch_id: string;

  @IsEnum(RosterPeriodType)
  period_type: RosterPeriodType;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}
