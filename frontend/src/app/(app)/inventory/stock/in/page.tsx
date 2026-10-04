import { getMe } from '@/lib/auth/dal';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { StockInForm } from './stock-in-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockInPage() {
  const me = await getMe();
  const [items, warehouses] = await Promise.all([
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock In</>}
        description={<>Record incoming stock.</>}
      />
      <StockInForm items={items} warehouses={warehouses} />
    </div>
  );
}
