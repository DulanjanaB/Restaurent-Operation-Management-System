import { getMe } from '@/lib/auth/dal';
import {
  getCategories,
  getItems,
  getUnits,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { ItemFormDialog } from './item-form-dialog';
import { ItemsTable } from './items-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function ItemsPage() {
  const [me, items, categories, units] = await Promise.all([
    getMe(),
    getItems(),
    getCategories(),
    getUnits(),
  ]);
  const canCreate = hasPermission(me, 'inventory.create');
  const canManage =
    hasPermission(me, 'inventory.update') &&
    hasPermission(me, 'inventory.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Items</>}
        description={<>The item catalog.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <ItemFormDialog categories={categories} units={units} />
            )}
          </div>
        }
      />
      <ItemsTable
        items={items}
        categories={categories}
        units={units}
        canManage={canManage}
      />
    </div>
  );
}
