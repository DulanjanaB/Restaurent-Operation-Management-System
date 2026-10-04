import { hasPermission } from '@/lib/permissions';
import { getAttendance } from '@/lib/server/roster/queries';
import { Users } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function TodaysRosterWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'roster.view')) return null;

  const records = await getAttendance({ date: today() }).catch(() => null);
  if (records === null) return null;

  const present = records.filter(
    (r) => r.status === 'present' || r.status === 'late',
  ).length;

  return (
    <WidgetCard
      title="Today's Attendance"
      href="/roster/attendance"
      icon={Users}
      tone="indigo"
    >
      <p className="text-2xl font-semibold">
        {present}
        <span className="text-base font-normal text-muted-foreground">
          {' '}
          / {records.length} present
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        {records.length} attendance records today
      </p>
    </WidgetCard>
  );
}
