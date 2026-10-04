import { getMe } from '@/lib/auth/dal';
import { getPreservedItems } from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { PreservedItemFormDialog } from './preserved-item-form-dialog';
import { PreservedItemsTable } from './preserved-items-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function PreservedItemsPage() {
  const [me, items] = await Promise.all([getMe(), getPreservedItems()]);
  const canCreate = hasPermission(me, 'food_preservation.create');
  const canManage =
    hasPermission(me, 'food_preservation.update') &&
    hasPermission(me, 'food_preservation.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sky"
        title={<>Preserved Items</>}
        description={
          <>Global catalog of items that get preserved in batches.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <PreservedItemFormDialog />}
          </div>
        }
      />
      <PreservedItemsTable items={items} canManage={canManage} />
    </div>
  );
}
