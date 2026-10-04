import { getMe } from '@/lib/auth/dal';
import {
  getChecklistAssignments,
  getChecklistTemplates,
} from '@/lib/server/checklist/queries';
import { getEmployees } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { AssignmentCreateDialog } from './assignment-create-dialog';
import { AssignmentsTable } from './assignments-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function ChecklistAssignmentsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const [assignments, templates, employees] = await Promise.all([
    getChecklistAssignments({}),
    getChecklistTemplates(branchId),
    getEmployees(branchId),
  ]);
  const canManage = hasPermission(me, 'checklist.assign');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="emerald"
        title={<>Checklist Assignments</>}
        description={
          <>
            Which employee is responsible for which checklist, and since when.
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <AssignmentCreateDialog
                templates={templates}
                employees={employees}
              />
            )}
          </div>
        }
      />
      <AssignmentsTable assignments={assignments} canManage={canManage} />
    </div>
  );
}
