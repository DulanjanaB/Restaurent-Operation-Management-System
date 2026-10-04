import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

// Profile fields only — per docs/user-management-design.md, not
// password/status/roles/permissions, which each have their own endpoint.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  primary_branch_id?: string;
}
