import { IsString, IsUUID } from 'class-validator';

export class AssignStaffDto {
  @IsUUID()
  staff_id: string;

  @IsString()
  role_in_event: string;
}
