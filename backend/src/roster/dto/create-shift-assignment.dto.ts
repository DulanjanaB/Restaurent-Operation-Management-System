import { IsUUID } from 'class-validator';

export class CreateShiftAssignmentDto {
  @IsUUID()
  shift_id: string;

  @IsUUID()
  employee_id: string;

  @IsUUID()
  position_id: string;
}
