import { getMe } from '@/lib/auth/dal';
import { getEmployees, getLeaveRequests } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { LeaveApprovalQueue } from './leave-approval-queue';
import { PageHeader } from '@/components/shared/page-header';

export default async function LeaveApprovalsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const [requests, employees] = await Promise.all([
    getLeaveRequests(),
    getEmployees(branchId),
  ]);
  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  const canDecide = hasPermission(me, 'roster.approve');

  const rows = requests
    .filter((request) => request.status === 'pending')
    .map((request) => ({
      ...request,
      employeeName: employeesById.get(request.employee_id)?.name ?? 'Unknown',
    }));

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Leave Approvals</>}
        description={<>Pending leave requests awaiting a decision.</>}
      />
      <LeaveApprovalQueue rows={rows} canDecide={canDecide} />
    </div>
  );
}
