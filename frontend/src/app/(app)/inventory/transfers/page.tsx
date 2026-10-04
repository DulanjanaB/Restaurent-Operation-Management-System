import { getMe } from '@/lib/auth/dal';
import {
  getItems,
  getTransfers,
  getWarehouses,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { TransferCreateDialog } from './transfer-create-dialog';
import { TransfersTable } from './transfers-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function TransfersPage() {
  const me = await getMe();
  const [transfers, items, warehouses] = await Promise.all([
    getTransfers(),
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);
  const canCreate = hasPermission(me, 'inventory.transfer');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock Transfers</>}
        description={<>Move stock between warehouses.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <TransferCreateDialog items={items} warehouses={warehouses} />
            )}
          </div>
        }
      />
      <TransfersTable transfers={transfers} />
    </div>
  );
}
