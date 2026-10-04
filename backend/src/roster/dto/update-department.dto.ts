import { IsString } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  name: string;
}
