import { IsNumberString, IsUUID } from 'class-validator';

export class IssueInventoryDto {
  @IsUUID()
  warehouse_id: string;

  @IsNumberString()
  quantity: string;
}
