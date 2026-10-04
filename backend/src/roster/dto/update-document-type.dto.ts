import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  requires_expiry?: boolean;
}
