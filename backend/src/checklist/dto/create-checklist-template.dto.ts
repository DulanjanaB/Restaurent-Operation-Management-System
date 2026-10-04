import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemInputDto {
  @IsInt()
  @Min(1)
  sequence: number;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  requires_reason_on_no?: boolean;
}

export class CreateChecklistTemplateDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemInputDto)
  items: ChecklistItemInputDto[];
}
