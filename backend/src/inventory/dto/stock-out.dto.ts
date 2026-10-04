import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class StockOutDto {
  @IsUUID()
  item_id: string;

  @IsUUID()
  warehouse_id: string;

  @IsNumberString()
  quantity: string;

  @IsOptional()
  @IsString()
  reference_type?: string;

  @IsOptional()
  @IsUUID()
  reference_id?: string;
}
