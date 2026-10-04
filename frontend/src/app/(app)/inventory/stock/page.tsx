import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMe } from '@/lib/auth/dal';
import { getStock, getWarehouses } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { StockTable } from './stock-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const warehouses = await getWarehouses(branchId);
  const rows = (
    await Promise.all(
      warehouses.map((warehouse) => getStock({ warehouseId: warehouse.id })),
    )
  ).flat();

  const canStockIn = hasPermission(me, 'inventory.stock_in');
  const canStockOut = hasPermission(me, 'inventory.stock_out');
  const canAdjust = hasPermission(me, 'inventory.stock_adjustment');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock</>}
        description={
          <>Current stock levels across your branch&apos;s warehouses.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/inventory/stock/batches">Batches</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/inventory/stock/movements">Movements</Link>
              </Button>
              {canStockIn && (
                <Button variant="outline" asChild>
                  <Link href="/inventory/stock/in">Stock In</Link>
                </Button>
              )}
              {canStockOut && (
                <Button variant="outline" asChild>
                  <Link href="/inventory/stock/out">Stock Out</Link>
                </Button>
              )}
              {canAdjust && (
                <Button variant="outline" asChild>
                  <Link href="/inventory/stock/adjustment">Adjust</Link>
                </Button>
              )}
            </div>
          </div>
        }
      />
      <StockTable rows={rows} />
    </div>
  );
}
