import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  employee_code: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsUUID()
  position_id: string;

  @IsUUID()
  department_id: string;

  @IsDateString()
  hire_date: string;

  // Every employee is a system user — the account is created first and linked here.
  @IsUUID()
  user_id: string;
}
