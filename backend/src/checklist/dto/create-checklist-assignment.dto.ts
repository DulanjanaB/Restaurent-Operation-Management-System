import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateChecklistAssignmentDto {
  @IsUUID()
  checklist_template_id: string;

  @IsUUID()
  employee_id: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
