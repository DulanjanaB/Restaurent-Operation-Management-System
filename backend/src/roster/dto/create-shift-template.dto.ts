import { IsString, IsUUID, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateShiftTemplateDto {
  @IsUUID()
  branch_id: string;

  @IsString()
  name: string;

  @Matches(TIME_PATTERN, { message: 'start_time must be HH:mm' })
  start_time: string;

  @Matches(TIME_PATTERN, { message: 'end_time must be HH:mm' })
  end_time: string;
}
