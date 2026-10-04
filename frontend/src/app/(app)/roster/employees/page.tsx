import { getMe } from '@/lib/auth/dal';
import {
  getDepartments,
  getEmployees,
  getPositions,
} from '@/lib/server/roster/queries';
import { getRoles } from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { EmployeeCreateDialog } from './employee-create-dialog';
import { EmployeesTable } from './employees-table';
import { BulkCreateLoginsButton } from './bulk-create-logins-button';
import { PageHeader } from '@/components/shared/page-header';

export default async function EmployeesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const canCreate = hasPermission(me, 'roster.create');
  const canCreateLogin = hasPermission(me, 'administration.user.create');
  const canAssignRoles = hasPermission(me, 'administration.user.assign_role');
  const [employees, positions, departments, roles] = await Promise.all([
    getEmployees(branchId),
    getPositions(),
    getDepartments(branchId),
    canCreate && canAssignRoles
      ? getRoles().catch(() => [])
      : Promise.resolve([]),
  ]);
  const missingLoginCount = employees.filter(
    (employee) => !employee.user_id,
  ).length;

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Employees</>}
        description={<>Staff in your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              {canCreateLogin && (
                <BulkCreateLoginsButton
                  branchId={branchId}
                  missingCount={missingLoginCount}
                />
              )}
              {canCreate && (
                <EmployeeCreateDialog
                  branchId={branchId}
                  positions={positions}
                  departments={departments}
                  roles={roles}
                  canCreateLogin={canCreateLogin}
                  canAssignRoles={canAssignRoles}
                />
              )}
            </div>
          </div>
        }
      />
      <EmployeesTable employees={employees} />
    </div>
  );
}
