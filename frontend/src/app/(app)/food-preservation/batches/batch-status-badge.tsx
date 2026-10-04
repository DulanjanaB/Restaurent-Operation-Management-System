import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import type { BatchStatus } from '@/lib/server/food-preservation/types';

const LABELS: Record<BatchStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  expired: { label: 'Expired', tone: 'warning' },
  consumed: { label: 'Consumed', tone: 'default' },
  disposed: { label: 'Disposed', tone: 'destructive' },
};

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  return (
    <StatusBadge
      status={status}
      resolve={(value) =>
        LABELS[value as BatchStatus] ?? { label: value, tone: 'default' }
      }
    />
  );
}
