import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddChecklistItemDto {
  @IsInt()
  @Min(1)
  sequence: number;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  requires_reason_on_no?: boolean;
}
