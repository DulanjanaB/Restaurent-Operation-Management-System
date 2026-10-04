import { getMe } from '@/lib/auth/dal';
import {
  getItems,
  getWarehouses,
  getWastageRequests,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { WastageRequestDialog } from './wastage-request-dialog';
import { WastageQueue } from './wastage-queue';
import { PageHeader } from '@/components/shared/page-header';

export default async function WastagePage() {
  const me = await getMe();
  const [requests, items, warehouses] = await Promise.all([
    getWastageRequests(),
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);
  const canCreate = hasPermission(me, 'inventory.create');
  const canDecide = hasPermission(me, 'inventory.approve');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Wastage</>}
        description={
          <>Requests to write off spoiled, damaged, or expired stock.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <WastageRequestDialog items={items} warehouses={warehouses} />
            )}
          </div>
        }
      />
      <WastageQueue requests={requests} canDecide={canDecide} />
    </div>
  );
}
