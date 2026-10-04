import { getMyChecklistRecords } from '@/lib/server/checklist/queries';
import { ApiError } from '@/lib/api/client';
import { ListChecks } from 'lucide-react';
import { WidgetCard } from '../widget-card';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Self-service, zero permission — pinned regardless of what the viewer can
// otherwise do, same as the nav item. Renders nothing if the account has
// no linked Employee record, or nothing is assigned today.
export async function TodaysChecklistWidget() {
  let records;
  try {
    records = await getMyChecklistRecords({ date: today() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
  if (records.length === 0) return null;

  const pending = records.filter(
    (record) => record.status === 'pending',
  ).length;

  return (
    <WidgetCard
      title="My Checklist Today"
      href="/checklist/today"
      icon={ListChecks}
      tone="teal"
      alert={pending > 0}
    >
      <p className="text-2xl font-semibold">
        {records.length - pending}
        <span className="text-base font-normal text-muted-foreground">
          {' '}
          / {records.length} done
        </span>
      </p>
      {pending > 0 && (
        <p className="text-sm text-destructive">{pending} still pending</p>
      )}
    </WidgetCard>
  );
}
