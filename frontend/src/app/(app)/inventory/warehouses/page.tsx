import { getMe } from '@/lib/auth/dal';
import { getWarehouses } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { WarehouseFormDialog } from './warehouse-form-dialog';
import { WarehousesTable } from './warehouses-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function WarehousesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const warehouses = await getWarehouses(branchId);
  const canCreate = hasPermission(me, 'inventory.create');
  const canManage =
    hasPermission(me, 'inventory.update') &&
    hasPermission(me, 'inventory.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Warehouses</>}
        description={<>Storage locations in your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <WarehouseFormDialog branchId={branchId} />}
          </div>
        }
      />
      <WarehousesTable
        warehouses={warehouses}
        branchId={branchId}
        canManage={canManage}
      />
    </div>
  );
}
