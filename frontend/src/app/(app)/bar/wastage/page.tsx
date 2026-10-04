import Link from 'next/link';
import { getMe } from '@/lib/auth/dal';
import {
  getWastageRequests,
  getWarehouses,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { BarWastageQueue } from './wastage-queue';
import { PageHeader } from '@/components/shared/page-header';

export default async function BarWastagePage() {
  const me = await getMe();
  const [requests, warehouses] = await Promise.all([
    getWastageRequests(),
    getWarehouses(me!.current_branch_id),
  ]);

  const barWarehouseIds = new Set(
    warehouses
      .filter((warehouse) => warehouse.type === 'bar')
      .map((warehouse) => warehouse.id),
  );
  const barRequests = requests.filter((request) =>
    barWarehouseIds.has(request.warehouse_id),
  );
  const canDecide = hasPermission(me, 'bar.approve');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="rose"
        title={<>Bar Wastage</>}
        description={
          <>
            Approve or reject wastage requests for bar stores. New requests are
            raised from{' '}
            <Link href="/inventory/wastage" className="underline">
              Inventory › Wastage
            </Link>
            .
          </>
        }
      />
      <BarWastageQueue requests={barRequests} canDecide={canDecide} />
    </div>
  );
}
