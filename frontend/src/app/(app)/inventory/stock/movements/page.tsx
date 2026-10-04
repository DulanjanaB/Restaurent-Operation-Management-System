import { getMe } from '@/lib/auth/dal';
import {
  getItems,
  getStockMovements,
  getWarehouses,
} from '@/lib/server/inventory/queries';
import { MovementsTable } from './movements-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockMovementsPage() {
  const me = await getMe();
  const [movements, items, warehouses] = await Promise.all([
    getStockMovements({}),
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock Movements</>}
        description={<>The full ledger of stock changes.</>}
      />
      <MovementsTable
        movements={movements}
        items={items}
        warehouses={warehouses}
      />
    </div>
  );
}
