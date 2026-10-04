import { getMe } from '@/lib/auth/dal';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { AdjustmentForm } from './adjustment-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockAdjustmentPage() {
  const me = await getMe();
  const [items, warehouses] = await Promise.all([
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock Adjustment</>}
        description={<>Directly correct a stock count.</>}
      />
      <AdjustmentForm items={items} warehouses={warehouses} />
    </div>
  );
}
