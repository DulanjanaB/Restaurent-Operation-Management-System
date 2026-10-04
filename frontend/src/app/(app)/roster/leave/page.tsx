import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMe } from '@/lib/auth/dal';
import { getEmployees, getLeaveRequests } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { LeaveRequestDialog } from './leave-request-dialog';
import { LeaveTable } from './leave-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function LeavePage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const [requests, employees] = await Promise.all([
    getLeaveRequests(),
    getEmployees(branchId),
  ]);
  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  const canCreate = hasPermission(me, 'roster.create');
  const canDelete = hasPermission(me, 'roster.delete');
  const canApprove = hasPermission(me, 'roster.approve');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Leave</>}
        description={<>Leave requests for your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2">
              {canApprove && (
                <Button variant="outline" asChild>
                  <Link href="/roster/leave/approvals">Approvals</Link>
                </Button>
              )}
              {canCreate && <LeaveRequestDialog employees={employees} />}
            </div>
          </div>
        }
      />
      <LeaveTable
        requests={requests}
        employeesById={employeesById}
        canDelete={canDelete}
      />
    </div>
  );
}
