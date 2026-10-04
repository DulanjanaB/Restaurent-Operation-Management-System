import { hasPermission } from '@/lib/permissions';
import { getExpiryAlertBatches } from '@/lib/server/food-preservation/queries';
import { CalendarClock } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

export async function ExpiringSoonWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'food_preservation.view')) return null;

  const batches = await getExpiryAlertBatches(3).catch(() => null);
  if (batches === null || batches.length === 0) return null;

  return (
    <WidgetCard
      title="Expiring Soon (3 days)"
      href="/food-preservation/expiry-alerts"
      icon={CalendarClock}
      alert
    >
      <p className="text-2xl font-semibold text-destructive">
        {batches.length}
      </p>
      <p className="text-sm text-muted-foreground">
        {batches
          .slice(0, 3)
          .map((batch) => batch.batch_code)
          .join(', ')}
        {batches.length > 3 && ` +${batches.length - 3} more`}
      </p>
    </WidgetCard>
  );
}
