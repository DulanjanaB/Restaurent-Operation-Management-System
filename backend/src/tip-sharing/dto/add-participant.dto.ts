import { IsUUID } from 'class-validator';

export class AddParticipantDto {
  @IsUUID()
  employee_id: string;
}
