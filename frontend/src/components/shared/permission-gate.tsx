import type { Me } from '@/lib/auth/dal';
import { hasAnyPermission, hasPermission, isSelf } from '@/lib/permissions';

// Plain Server Component — most gating happens server-side where `me` is
// already available. Client islands that need a gated boolean should
// receive it as a prop from their Server Component parent instead of
// importing this (re-deriving permissions client-side is not the pattern
// here — see the plan's "Cross-cutting components" section).
export function PermissionGate({
  me,
  require,
  requireAny,
  selfUserId,
  fallback = null,
  children,
}: {
  me: Me | null;
  require?: string;
  requireAny?: string[];
  // When set, the gate also passes if `me.id === selfUserId` — the
  // self-service exception pattern (Roster Documents, Tip Balance,
  // Checklist records).
  selfUserId?: string | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const allowedBySelf = isSelf(me, selfUserId);
  const allowedByPermission = require
    ? hasPermission(me, require)
    : requireAny
      ? hasAnyPermission(me, requireAny)
      : true;

  if (!allowedBySelf && !allowedByPermission) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
