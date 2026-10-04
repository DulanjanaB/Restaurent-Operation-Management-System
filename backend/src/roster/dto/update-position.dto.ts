import { IsString } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  name: string;
}
