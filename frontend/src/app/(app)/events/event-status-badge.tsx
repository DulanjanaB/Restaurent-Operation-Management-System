import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import type { EventStatus } from '@/lib/server/events/types';

const LABELS: Record<EventStatus, { label: string; tone: StatusTone }> = {
  requested: { label: 'Requested', tone: 'default' },
  confirmed: { label: 'Confirmed', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <StatusBadge
      status={status}
      resolve={(value) =>
        LABELS[value as EventStatus] ?? { label: value, tone: 'default' }
      }
    />
  );
}
