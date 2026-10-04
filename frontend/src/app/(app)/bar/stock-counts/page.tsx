import { getMe } from '@/lib/auth/dal';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { getBarStockCounts } from '@/lib/server/bar/queries';
import { StockCountForm } from './stock-count-form';
import { CountsTable } from './counts-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockCountsPage() {
  const me = await getMe();
  const [items, warehouses, counts] = await Promise.all([
    getItems(),
    getWarehouses(me!.current_branch_id),
    getBarStockCounts({}),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        tone="rose"
        title={<>Bar Stock Counts</>}
        description={<>Record a physical count for reconciliation.</>}
      />
      <StockCountForm items={items} warehouses={warehouses} />
      <CountsTable counts={counts} items={items} warehouses={warehouses} />
    </div>
  );
}
