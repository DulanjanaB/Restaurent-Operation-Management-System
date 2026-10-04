import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDocumentTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  requires_expiry?: boolean;
}
