import type { Me } from './auth/dal';

export function hasPermission(me: Me | null, key: string): boolean {
  return me?.permissions.includes(key) ?? false;
}

export function hasAnyPermission(me: Me | null, keys: string[]): boolean {
  return keys.some((key) => hasPermission(me, key));
}

// Self-service exception pattern used across Roster Employee Documents,
// Tip Sharing balances, and Checklist records: an employee with a linked
// User account can always act on their OWN record, no permission needed.
// `targetUserId` is the record's linked Employee.user_id (or equivalent).
export function isSelf(
  me: Me | null,
  targetUserId: string | null | undefined,
): boolean {
  return !!me && !!targetUserId && me.id === targetUserId;
}
