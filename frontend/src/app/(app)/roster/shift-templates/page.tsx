import { getMe } from '@/lib/auth/dal';
import { getShiftTemplates } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { ShiftTemplateFormDialog } from './shift-template-form-dialog';
import { ShiftTemplatesTable } from './shift-templates-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function ShiftTemplatesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const templates = await getShiftTemplates(branchId);
  const canCreate = hasPermission(me, 'roster.create');
  const canManage =
    hasPermission(me, 'roster.update') && hasPermission(me, 'roster.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Shift Templates</>}
        description={<>Reusable shift patterns for your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <ShiftTemplateFormDialog branchId={branchId} />}
          </div>
        }
      />
      <ShiftTemplatesTable
        templates={templates}
        branchId={branchId}
        canManage={canManage}
      />
    </div>
  );
}
