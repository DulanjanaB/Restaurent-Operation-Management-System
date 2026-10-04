import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateVenueDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;
}
