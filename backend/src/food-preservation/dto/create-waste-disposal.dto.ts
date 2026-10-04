import { IsEnum, IsNumberString, IsUUID } from 'class-validator';
import { WasteDisposalReason } from '../waste-disposal.enums';

export class CreateWasteDisposalDto {
  @IsUUID()
  batch_id: string;

  @IsNumberString()
  quantity: string;

  @IsEnum(WasteDisposalReason)
  reason: WasteDisposalReason;
}
