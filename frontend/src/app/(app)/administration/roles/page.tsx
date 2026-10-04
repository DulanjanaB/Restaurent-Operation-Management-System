import { getMe } from '@/lib/auth/dal';
import { getRoles } from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { RoleCreateDialog } from './role-create-dialog';
import { RolesTable } from './roles-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function RolesPage() {
  const [me, roles] = await Promise.all([getMe(), getRoles()]);
  const canCreate = hasPermission(me, 'administration.role.create');
  const canDelete = hasPermission(me, 'administration.role.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="indigo"
        title={<>Roles</>}
        description={<>Bundles of permissions assigned to users.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <RoleCreateDialog />}
          </div>
        }
      />
      <RolesTable roles={roles} canDelete={canDelete} />
    </div>
  );
}
