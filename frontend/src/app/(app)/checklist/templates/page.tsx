import { getMe } from '@/lib/auth/dal';
import { getChecklistTemplates } from '@/lib/server/checklist/queries';
import { hasPermission } from '@/lib/permissions';
import { TemplateCreateDialog } from './template-create-dialog';
import { TemplatesTable } from './templates-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function ChecklistTemplatesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const templates = await getChecklistTemplates(branchId);
  const canCreate = hasPermission(me, 'checklist.create');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="emerald"
        title={<>Checklist Templates</>}
        description={
          <>Define a set of daily Yes/No items to assign to staff.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <TemplateCreateDialog branchId={branchId} />}
          </div>
        }
      />
      <TemplatesTable templates={templates} />
    </div>
  );
}
