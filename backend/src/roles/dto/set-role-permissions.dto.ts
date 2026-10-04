import { ArrayUnique, IsUUID } from 'class-validator';

// Full replace, not incremental add/remove — matches the Role Management
// screen's checklist UI (docs/role-management-design.md): the client sends
// the complete set of checked permission ids each time it saves.
export class SetRolePermissionsDto {
  @IsUUID('4', { each: true })
  @ArrayUnique()
  permission_ids: string[];
}
