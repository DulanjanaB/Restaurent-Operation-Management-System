import { IsNumberString, IsUUID } from 'class-validator';

export class AddIngredientDto {
  @IsUUID()
  item_id: string;

  @IsNumberString()
  quantity_per_serving: string;

  @IsUUID()
  unit_id: string;
}
