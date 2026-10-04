import { IsNumberString, IsString } from 'class-validator';

export class CreateBarRecipeDto {
  @IsString()
  name: string;

  @IsNumberString()
  selling_price: string;
}
