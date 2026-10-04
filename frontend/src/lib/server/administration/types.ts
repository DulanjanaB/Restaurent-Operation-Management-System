export type ActiveStatus = 'active' | 'inactive';
export type PermissionEffect = 'grant' | 'revoke';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  status: ActiveStatus;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatar_url?: string | null;
  name: string;
  status: ActiveStatus;
  primary_branch_id: string | null;
  primary_branch: Branch | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
}

export interface Permission {
  id: string;
  key: string;
  module: string;
  resource: string | null;
  action: string;
  description: string | null;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  branch_id: string | null;
  role: Role;
  branch: Branch | null;
}

export interface UserPermissionOverride {
  user_id: string;
  permission_id: string;
  effect: PermissionEffect;
  permission: Permission;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  branch_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
