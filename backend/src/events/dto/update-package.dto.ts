import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  name?: string;

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
