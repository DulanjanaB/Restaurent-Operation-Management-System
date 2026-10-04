import { IsNumberString, IsUUID } from 'class-validator';

export class CreateBarSaleDto {
  @IsUUID()
  warehouse_id: string;

  @IsUUID()
  recipe_id: string;

  @IsNumberString()
  quantity: string;
}
