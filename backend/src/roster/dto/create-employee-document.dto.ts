import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

// file_url is taken as-is for now — there's no file-upload/storage service
// yet (see docs/settings-design.md's logo-upload note for the pattern this
// should eventually follow: a dedicated multipart endpoint that returns a
// URL, not a raw string from the client).
export class CreateEmployeeDocumentDto {
  @IsUUID()
  employee_id: string;

  @IsUUID()
  document_type_id: string;

  @IsString()
  file_url: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
