import { hasPermission } from '@/lib/permissions';
import { getChecklistRecords } from '@/lib/server/checklist/queries';
import { ClipboardList } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Literal query the design doc documents for this exact widget.
export async function IncompleteChecklistsWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'checklist.view')) return null;

  const records = await getChecklistRecords({
    status: 'pending',
    date: today(),
  }).catch(() => null);
  if (records === null || records.length === 0) return null;

  return (
    <WidgetCard
      title="Incomplete Checklists Today"
      href="/checklist/records?status=pending"
      icon={ClipboardList}
      alert
    >
      <p className="text-2xl font-semibold text-destructive">
        {records.length}
      </p>
      <p className="text-sm text-muted-foreground">
        {records
          .slice(0, 3)
          .map((record) => record.employee?.name ?? record.employee_id)
          .join(', ')}
        {records.length > 3 && ` +${records.length - 3} more`}
      </p>
    </WidgetCard>
  );
}
