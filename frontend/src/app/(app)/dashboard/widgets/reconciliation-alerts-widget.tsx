import { hasPermission } from '@/lib/permissions';
import { getBarStockCounts, getReconciliation } from '@/lib/server/bar/queries';
import { getItems } from '@/lib/server/inventory/queries';
import { Scale } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// There's no bulk "all variances" endpoint — reconciliation is computed
// per item+warehouse+date range. This widget looks at today's recorded
// stock counts (a bounded, naturally small set) and reconciles each
// distinct item/warehouse pair individually.
export async function ReconciliationAlertsWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'bar.report')) return null;

  const counts = await getBarStockCounts({}).catch(() => null);
  if (counts === null) return null;

  const todaysCounts = counts.filter((count) => count.counted_at === today());
  if (todaysCounts.length === 0) return null;

  const pairs = new Map<string, { warehouseId: string; itemId: string }>();
  for (const count of todaysCounts) {
    pairs.set(`${count.warehouse_id}:${count.item_id}`, {
      warehouseId: count.warehouse_id,
      itemId: count.item_id,
    });
  }

  const [items, results] = await Promise.all([
    getItems().catch(() => []),
    Promise.all(
      [...pairs.values()].map((pair) =>
        getReconciliation({
          warehouseId: pair.warehouseId,
          itemId: pair.itemId,
          dateFrom: today(),
          dateTo: today(),
        }).catch(() => null),
      ),
    ),
  ]);

  const itemsById = new Map(items.map((item) => [item.id, item]));

  const variances = results.filter(
    (result) =>
      result && result.variance !== null && Number(result.variance) !== 0,
  );
  if (variances.length === 0) return null;

  return (
    <WidgetCard
      title="Reconciliation Variances Today"
      href="/bar/reconciliation"
      icon={Scale}
      alert
    >
      <p className="text-2xl font-semibold text-destructive">
        {variances.length}
      </p>
      <p className="text-sm text-muted-foreground">
        {variances
          .slice(0, 3)
          .map(
            (result) => itemsById.get(result!.item_id)?.name ?? result!.item_id,
          )
          .join(', ')}
        {variances.length > 3 && ` +${variances.length - 3} more`}
      </p>
    </WidgetCard>
  );
}
