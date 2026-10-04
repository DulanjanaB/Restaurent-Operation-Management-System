import { IsOptional, IsString } from 'class-validator';

// Name/description only — per docs/role-management-design.md, "Edit"
// doesn't touch permissions (that's the separate "Manage Permissions"
// action) or is_system_role (never user-settable).
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
