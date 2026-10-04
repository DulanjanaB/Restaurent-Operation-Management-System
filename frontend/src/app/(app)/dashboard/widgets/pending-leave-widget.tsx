import { hasPermission } from '@/lib/permissions';
import { getLeaveRequests } from '@/lib/server/roster/queries';
import { CalendarDays } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

export async function PendingLeaveWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'roster.view')) return null;

  const requests = await getLeaveRequests().catch(() => null);
  if (requests === null) return null;

  const pending = requests.filter((request) => request.status === 'pending');
  if (pending.length === 0) return null;

  return (
    <WidgetCard
      title="Pending Leave Requests"
      href="/roster/leave/approvals"
      icon={CalendarDays}
      tone="sky"
    >
      <p className="text-2xl font-semibold">{pending.length}</p>
      <p className="text-sm text-muted-foreground">Awaiting a decision</p>
    </WidgetCard>
  );
}
