import { IsOptional, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  role_id: string;

  // Omitted/null = applies across all branches — see
  // docs/rbac-design.md#userrole-join.
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}
