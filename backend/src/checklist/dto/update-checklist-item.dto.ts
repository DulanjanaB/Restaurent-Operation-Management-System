import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  requires_reason_on_no?: boolean;
}
