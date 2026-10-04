import { IsInt, IsISO8601, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateEventDto {
  @IsUUID()
  branch_id: string;

  @IsUUID()
  event_type_id: string;

  @IsUUID()
  customer_id: string;

  @IsUUID()
  venue_id: string;

  @IsOptional()
  @IsUUID()
  package_id?: string;

  @IsISO8601()
  event_date: string;

  @IsInt()
  @Min(1)
  guest_count: number;
}
