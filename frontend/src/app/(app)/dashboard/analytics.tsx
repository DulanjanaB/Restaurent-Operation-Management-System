import type { Me } from '@/lib/auth/dal';
import { hasPermission } from '@/lib/permissions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAttendance } from '@/lib/server/roster/queries';
import { getStockMovements } from '@/lib/server/inventory/queries';
import { getTipPools } from '@/lib/server/tip-sharing/queries';
import {
  CHART_COLORS,
  StatusDonut,
  TrendArea,
  TrendBars,
  type SeriesKey,
} from './charts';

const WINDOW_DAYS = 14;

const ATTENDANCE_SERIES: SeriesKey[] = [
  { key: 'present', label: 'Present', color: CHART_COLORS.emerald },
  { key: 'late', label: 'Late', color: CHART_COLORS.amber },
  { key: 'half_day', label: 'Half day', color: CHART_COLORS.indigo },
  { key: 'absent', label: 'Absent', color: CHART_COLORS.rose },
];

const STOCK_IN_TYPES = new Set([
  'stock_in',
  'transfer_in',
  'adjustment_increase',
]);
const STOCK_OUT_TYPES = new Set([
  'stock_out',
  'transfer_out',
  'wastage',
  'adjustment_decrease',
]);

// ISO dates (YYYY-MM-DD), oldest first, ending today.
function lastDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let offset = count - 1; offset >= 0; offset--) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

export async function Analytics({ me }: { me: Me }) {
  const days = lastDays(WINDOW_DAYS);
  const today = days[days.length - 1];
  const from = days[0];
  const canAttendance = hasPermission(me, 'roster.view');
  const canTips = hasPermission(me, 'tip.view');
  const canStock = hasPermission(me, 'inventory.view');

  if (!canAttendance && !canTips && !canStock) return null;

  const [attendance, pools, movements] = await Promise.all([
    canAttendance
      ? getAttendance({ dateFrom: from, dateTo: today }).catch(() => null)
      : Promise.resolve(null),
    canTips
      ? getTipPools(me.current_branch_id).catch(() => null)
      : Promise.resolve(null),
    canStock ? getStockMovements({}).catch(() => null) : Promise.resolve(null),
  ]);

  const attendanceTrend = attendance
    ? days.map((day) => {
        const row: Record<string, string | number> = { label: dayLabel(day) };
        for (const item of ATTENDANCE_SERIES) row[item.key] = 0;
        for (const record of attendance) {
          if (record.date === day && record.status in row) {
            row[record.status] = Number(row[record.status]) + 1;
          }
        }
        return row;
      })
    : null;

  const todaysCounts = attendance
    ? ATTENDANCE_SERIES.map((item) => ({
        name: item.key,
        value: attendance.filter(
          (record) => record.date === today && record.status === item.key,
        ).length,
        color: item.color,
      }))
    : null;
  const todaysTotal =
    todaysCounts?.reduce((sum, item) => sum + item.value, 0) ?? 0;

  const tipTrend = pools
    ? days.map((day) => ({
        label: dayLabel(day),
        value: pools
          .filter((pool) => pool.date === day)
          .reduce((sum, pool) => sum + Number(pool.total_amount), 0),
      }))
    : null;
  const tipsInWindow =
    tipTrend?.reduce((sum, point) => sum + point.value, 0) ?? 0;

  const stockFlow = movements
    ? days.map((day) => {
        const onDay = movements.filter(
          (movement) => movement.occurred_at.slice(0, 10) === day,
        );
        return {
          label: dayLabel(day),
          in: onDay.filter((movement) => STOCK_IN_TYPES.has(movement.type))
            .length,
          out: onDay.filter((movement) => STOCK_OUT_TYPES.has(movement.type))
            .length,
        };
      })
    : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Trends & attendance
        </h2>
        <p className="text-sm text-muted-foreground">
          Last {WINDOW_DAYS} days · {dayLabel(from)} – {dayLabel(today)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {attendanceTrend && (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Attendance trend</CardTitle>
              <CardDescription>
                Daily attendance outcomes for your branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendBars
                data={attendanceTrend}
                series={ATTENDANCE_SERIES}
                stacked
              />
            </CardContent>
          </Card>
        )}

        {todaysCounts && (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s attendance</CardTitle>
              <CardDescription>
                {todaysTotal > 0
                  ? 'Breakdown by status'
                  : 'No attendance recorded yet today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusDonut
                data={todaysCounts}
                total={todaysTotal}
                centerLabel="records today"
              />
            </CardContent>
          </Card>
        )}

        {tipTrend && (
          <Card>
            <CardHeader>
              <CardTitle>Tip distribution</CardTitle>
              <CardDescription>
                {tipsInWindow.toFixed(2)} distributed in this window
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendArea
                data={tipTrend}
                label="Tips"
                color={CHART_COLORS.violet}
              />
            </CardContent>
          </Card>
        )}

        {stockFlow && (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Stock movements</CardTitle>
              <CardDescription>
                Number of incoming vs outgoing stock entries per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendBars
                data={stockFlow}
                series={[
                  { key: 'in', label: 'Incoming', color: CHART_COLORS.sky },
                  { key: 'out', label: 'Outgoing', color: CHART_COLORS.amber },
                ]}
                stacked={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
