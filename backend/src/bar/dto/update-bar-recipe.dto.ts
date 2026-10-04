import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateBarRecipeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumberString()
  selling_price?: string;
}
