import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import {
  getPermissions,
  getRole,
  getRolePermissionIds,
} from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { RoleEditForm } from './role-edit-form';
import { PermissionChecklist } from './permission-checklist';
import { PageHeader } from '@/components/shared/page-header';

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let role;
  try {
    [role] = await Promise.all([getRole(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [permissionIds, allPermissions] = await Promise.all([
    getRolePermissionIds(id),
    getPermissions(),
  ]);

  const canUpdate = hasPermission(me, 'administration.role.update');
  const canManagePermissions = hasPermission(
    me,
    'administration.role.manage_permissions',
  );

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        tone="indigo"
        title={
          <>
            {role.name}
            {role.is_system_role && (
              <Badge variant="secondary" className="ml-3 align-middle">
                System role
              </Badge>
            )}
          </>
        }
        description={role.description || 'No description.'}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Details</h2>
        {canUpdate ? (
          <RoleEditForm role={role} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {role.description || 'No description.'}
          </p>
        )}
      </section>

      {canManagePermissions && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Permissions
          </h2>
          <PermissionChecklist
            roleId={role.id}
            allPermissions={allPermissions}
            initialPermissionIds={permissionIds}
            readOnly={role.is_system_role}
          />
        </section>
      )}
    </div>
  );
}
