import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AnswerChecklistItemDto {
  @IsBoolean()
  answer: boolean;

  // Required by the service (not here) when answer = false and the
  // item's requires_reason_on_no — see docs/checklist-design.md.
  @IsOptional()
  @IsString()
  reason?: string;
}
