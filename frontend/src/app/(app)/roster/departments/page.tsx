import { getMe } from '@/lib/auth/dal';
import { getDepartments } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { DepartmentFormDialog } from './department-form-dialog';
import { DepartmentsTable } from './departments-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function DepartmentsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const [departments] = await Promise.all([getDepartments(branchId)]);
  const canCreate = hasPermission(me, 'roster.create');
  const canManage =
    hasPermission(me, 'roster.update') && hasPermission(me, 'roster.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Departments</>}
        description={<>Departments in your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <DepartmentFormDialog branchId={branchId} />}
          </div>
        }
      />
      <DepartmentsTable
        departments={departments}
        branchId={branchId}
        canManage={canManage}
      />
    </div>
  );
}
