import { getMe } from '@/lib/auth/dal';
import { getCategories } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { CategoryFormDialog } from './category-form-dialog';
import { CategoriesTable } from './categories-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function CategoriesPage() {
  const [me, categories] = await Promise.all([getMe(), getCategories()]);
  const canCreate = hasPermission(me, 'inventory.create');
  const canManage =
    hasPermission(me, 'inventory.update') &&
    hasPermission(me, 'inventory.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Categories</>}
        description={<>Item categories.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <CategoryFormDialog />}
          </div>
        }
      />
      <CategoriesTable categories={categories} canManage={canManage} />
    </div>
  );
}
