import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  price_per_guest?: string;

  @IsOptional()
  @IsNumberString()
  flat_price?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
