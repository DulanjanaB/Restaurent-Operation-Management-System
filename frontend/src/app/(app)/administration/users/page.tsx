import { getMe } from '@/lib/auth/dal';
import { getBranches, getUsers } from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { UserCreateDialog } from './user-create-dialog';
import { UsersTable } from './users-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function UsersPage() {
  const [me, users, branches] = await Promise.all([
    getMe(),
    getUsers(),
    getBranches().catch(() => []),
  ]);
  const canCreate = hasPermission(me, 'administration.user.create');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="indigo"
        title={<>Users</>}
        description={<>People who can log in to this system.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <UserCreateDialog branches={branches} />}
          </div>
        }
      />
      <UsersTable users={users} />
    </div>
  );
}
