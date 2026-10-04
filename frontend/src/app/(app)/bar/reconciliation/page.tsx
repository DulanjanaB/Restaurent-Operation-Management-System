import { getMe } from '@/lib/auth/dal';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { getReconciliation } from '@/lib/server/bar/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{
    warehouse_id?: string;
    item_id?: string;
    date_from?: string;
    date_to?: string;
  }>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const [items, warehouses] = await Promise.all([
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);

  // The backend's reconciliation endpoint has no DTO validation at all
  // (plain @Query() strings) — only call it once every filter is present,
  // to avoid sending it malformed input it won't reject cleanly.
  const canQuery =
    !!params.warehouse_id &&
    !!params.item_id &&
    !!params.date_from &&
    !!params.date_to;
  const result = canQuery
    ? await getReconciliation({
        warehouseId: params.warehouse_id!,
        itemId: params.item_id!,
        dateFrom: params.date_from!,
        dateTo: params.date_to!,
      })
    : null;

  const variance = result?.variance ? Number(result.variance) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        tone="rose"
        title={<>Stock Reconciliation</>}
        description={
          <>Compare expected stock (from movements) against a physical count.</>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="warehouse_id">Warehouse</Label>
          <Select
            name="warehouse_id"
            defaultValue={params.warehouse_id}
            required
          >
            <SelectTrigger id="warehouse_id" className="w-44">
              <SelectValue placeholder="Choose a warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item_id">Item</Label>
          <Select name="item_id" defaultValue={params.item_id} required>
            <SelectTrigger id="item_id" className="w-44">
              <SelectValue placeholder="Choose an item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_from">From</Label>
          <Input
            id="date_from"
            name="date_from"
            type="date"
            defaultValue={params.date_from}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_to">To</Label>
          <Input
            id="date_to"
            name="date_to"
            type="date"
            defaultValue={params.date_to}
            required
          />
        </div>
        <Button type="submit">Check</Button>
      </form>

      {result && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Opening
              </CardTitle>
            </CardHeader>
            <CardContent>{result.opening}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Stock In
              </CardTitle>
            </CardHeader>
            <CardContent>{result.stock_in}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Sold
              </CardTitle>
            </CardHeader>
            <CardContent>{result.sold}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Wastage
              </CardTitle>
            </CardHeader>
            <CardContent>{result.wastage}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Expected Closing
              </CardTitle>
            </CardHeader>
            <CardContent>{result.expected_closing}</CardContent>
          </Card>
          <Card className={cn(variance !== 0 && 'border-destructive')}>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Variance
              </CardTitle>
            </CardHeader>
            <CardContent
              className={cn(
                'text-lg font-semibold',
                variance !== 0 && 'text-destructive',
              )}
            >
              {result.variance ?? 'No count recorded'}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
