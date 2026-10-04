import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getChecklistTemplate } from '@/lib/server/checklist/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { EditTemplateForm } from './edit-template-form';
import { ItemsList } from './items-list';
import { AddItemDialog } from './add-item-dialog';
import { PageHeader } from '@/components/shared/page-header';

export default async function ChecklistTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let template;
  try {
    template = await getChecklistTemplate(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const canUpdate = hasPermission(me, 'checklist.update');
  const nextSequence =
    template.items.reduce((max, item) => Math.max(max, item.sequence), 0) + 1;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="emerald"
        title={<>{template.name}</>}
        description={template.area ? <>{template.area}</> : undefined}
      />

      {canUpdate && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Details
          </h2>
          <EditTemplateForm template={template} />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Items</h2>
          {canUpdate && (
            <AddItemDialog templateId={id} nextSequence={nextSequence} />
          )}
        </div>
        <ItemsList
          templateId={id}
          items={template.items}
          canManage={canUpdate}
        />
      </div>
    </div>
  );
}
