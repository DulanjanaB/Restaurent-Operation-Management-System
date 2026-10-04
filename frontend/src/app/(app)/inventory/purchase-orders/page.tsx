import { getMe } from '@/lib/auth/dal';
import {
  getItems,
  getPurchaseOrders,
  getSuppliers,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { PoCreateDialog } from './po-create-dialog';
import { PosTable } from './pos-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function PurchaseOrdersPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const [orders, items, suppliers] = await Promise.all([
    getPurchaseOrders(),
    getItems(),
    getSuppliers(),
  ]);
  const canCreate = hasPermission(me, 'inventory.manage_purchase_orders');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Purchase Orders</>}
        description={<>Procurement orders to suppliers.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <PoCreateDialog
                branchId={branchId}
                items={items}
                suppliers={suppliers}
              />
            )}
          </div>
        }
      />
      <PosTable orders={orders} />
    </div>
  );
}
