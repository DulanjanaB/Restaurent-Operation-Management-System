import { IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;
}
