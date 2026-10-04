import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  AppUser,
  AuditLogEntry,
  Branch,
  Permission,
  Role,
  UserPermissionOverride,
  UserRoleAssignment,
} from './types';

export function getBranches(): Promise<Branch[]> {
  return apiFetch<Branch[]>('/branches');
}

export function getBranch(id: string): Promise<Branch> {
  return apiFetch<Branch>(`/branches/${id}`);
}

export function getUsers(): Promise<AppUser[]> {
  return apiFetch<AppUser[]>('/users');
}

export function getUser(id: string): Promise<AppUser> {
  return apiFetch<AppUser>(`/users/${id}`);
}

export function getUserRoles(id: string): Promise<UserRoleAssignment[]> {
  return apiFetch<UserRoleAssignment[]>(`/users/${id}/roles`);
}

export function getUserPermissionOverrides(
  id: string,
): Promise<UserPermissionOverride[]> {
  return apiFetch<UserPermissionOverride[]>(`/users/${id}/permissions`);
}

export function getRoles(): Promise<Role[]> {
  return apiFetch<Role[]>('/roles');
}

export function getRole(id: string): Promise<Role> {
  return apiFetch<Role>(`/roles/${id}`);
}

export function getRolePermissionIds(id: string): Promise<string[]> {
  return apiFetch<string[]>(`/roles/${id}/permissions`);
}

export function getPermissions(): Promise<Permission[]> {
  return apiFetch<Permission[]>('/permissions');
}

export function getAuditLog(filters: {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (filters.actorId) params.set('actor_id', filters.actorId);
  if (filters.entityType) params.set('entity_type', filters.entityType);
  if (filters.entityId) params.set('entity_id', filters.entityId);
  if (filters.dateFrom) params.set('date_from', filters.dateFrom);
  if (filters.dateTo) params.set('date_to', filters.dateTo);
  const query = params.toString();
  return apiFetch<AuditLogEntry[]>(`/audit-log${query ? `?${query}` : ''}`);
}
