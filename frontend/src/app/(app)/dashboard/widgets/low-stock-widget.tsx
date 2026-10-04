import { hasPermission } from '@/lib/permissions';
import { getStock } from '@/lib/server/inventory/queries';
import { PackageX } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

export async function LowStockWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'inventory.view')) return null;

  const stock = await getStock({}).catch(() => null);
  if (stock === null) return null;

  const low = stock.filter((row) => row.status !== 'available');
  if (low.length === 0) return null;

  return (
    <WidgetCard title="Low Stock" href="/inventory/stock" icon={PackageX} alert>
      <p className="text-2xl font-semibold text-destructive">{low.length}</p>
      <p className="text-sm text-muted-foreground">
        {low
          .slice(0, 3)
          .map((row) => row.item?.name ?? row.item_id)
          .join(', ')}
        {low.length > 3 && ` +${low.length - 3} more`}
      </p>
    </WidgetCard>
  );
}
