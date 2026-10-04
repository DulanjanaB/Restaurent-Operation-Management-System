import { getMe } from '@/lib/auth/dal';
import { getSuppliers } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { SupplierFormDialog } from './supplier-form-dialog';
import { SuppliersTable } from './suppliers-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function SuppliersPage() {
  const [me, suppliers] = await Promise.all([getMe(), getSuppliers()]);
  const canCreate = hasPermission(me, 'inventory.create');
  const canManage =
    hasPermission(me, 'inventory.update') &&
    hasPermission(me, 'inventory.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Suppliers</>}
        description={<>Suppliers, shared across all branches.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <SupplierFormDialog />}
          </div>
        }
      />
      <SuppliersTable suppliers={suppliers} canManage={canManage} />
    </div>
  );
}
