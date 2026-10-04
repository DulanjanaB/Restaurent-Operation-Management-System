import {
  IsDateString,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { AttendanceStatus } from '../attendance.enum';

export class CreateAttendanceDto {
  @IsUUID()
  employee_id: string;

  @IsOptional()
  @IsUUID()
  shift_assignment_id?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsISO8601()
  clock_in?: string;

  @IsOptional()
  @IsISO8601()
  clock_out?: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
