import {
  IsInt,
  IsISO8601,
  IsNumberString,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsUUID()
  event_type_id?: string;

  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsUUID()
  venue_id?: string;

  @IsOptional()
  @IsUUID()
  package_id?: string;

  @IsOptional()
  @IsISO8601()
  event_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  guest_count?: number;

  @IsOptional()
  @IsNumberString()
  revenue_override?: string;
}
