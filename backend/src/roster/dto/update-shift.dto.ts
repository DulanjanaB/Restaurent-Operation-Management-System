import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class UpdateShiftDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'start_time must be HH:mm' })
  start_time?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'end_time must be HH:mm' })
  end_time?: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;
}
