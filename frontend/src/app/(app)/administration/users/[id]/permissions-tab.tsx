import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { AddPermissionOverrideDialog } from './add-permission-override-dialog';
import { RemovePermissionOverrideButton } from './remove-permission-override-button';
import type {
  Permission,
  UserPermissionOverride,
} from '@/lib/server/administration/types';

export function PermissionsTab({
  userId,
  overrides,
  allPermissions,
  canManage,
}: {
  userId: string;
  overrides: UserPermissionOverride[];
  allPermissions: Permission[];
  canManage: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Per-user overrides on top of role permissions. Revoke always wins over
        any role that would otherwise grant it.
      </p>
      {canManage && (
        <div className="flex justify-end">
          <AddPermissionOverrideDialog
            userId={userId}
            permissions={allPermissions}
          />
        </div>
      )}
      {overrides.length === 0 ? (
        <EmptyState title="No permission overrides" />
      ) : (
        <ul className="divide-y rounded-md border">
          {overrides.map((override) => (
            <li
              key={override.permission_id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-mono text-sm">
                {override.permission.key}
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    override.effect === 'grant' ? 'secondary' : 'destructive'
                  }
                >
                  {override.effect}
                </Badge>
                {canManage && (
                  <RemovePermissionOverrideButton
                    userId={userId}
                    permissionId={override.permission_id}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
