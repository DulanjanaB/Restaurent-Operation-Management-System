import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../attendance.enum';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsISO8601()
  clock_in?: string;

  @IsOptional()
  @IsISO8601()
  clock_out?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
