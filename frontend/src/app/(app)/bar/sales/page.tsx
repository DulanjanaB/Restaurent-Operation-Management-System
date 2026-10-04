import { getMe } from '@/lib/auth/dal';
import { getBarRecipes } from '@/lib/server/bar/queries';
import { getWarehouses } from '@/lib/server/inventory/queries';
import { WarehousePicker } from './warehouse-picker';
import { SaleEntry } from './sale-entry';
import { PageHeader } from '@/components/shared/page-header';

export default async function BarSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ warehouse_id?: string }>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const [recipes, warehouses] = await Promise.all([
    getBarRecipes(),
    getWarehouses(me!.current_branch_id),
  ]);

  const barWarehouses = warehouses.filter((w) => w.type === 'bar');
  const list = barWarehouses.length > 0 ? barWarehouses : warehouses;
  const warehouseId = params.warehouse_id ?? list[0]?.id;

  return (
    <div className="space-y-4">
      <PageHeader
        tone="rose"
        title={<>Record a Sale</>}
        description={<>Tap a drink to record one sale.</>}
      />
      <WarehousePicker warehouses={list} currentId={warehouseId} />
      {warehouseId && <SaleEntry warehouseId={warehouseId} recipes={recipes} />}
    </div>
  );
}
