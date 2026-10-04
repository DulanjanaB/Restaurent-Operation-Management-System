import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ShiftAssignmentStatus } from '../shift-assignment.enum';

export class UpdateShiftAssignmentDto {
  @IsOptional()
  @IsUUID()
  position_id?: string;

  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}
