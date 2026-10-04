import { getMe } from '@/lib/auth/dal';
import { LowStockWidget } from './widgets/low-stock-widget';
import { ExpiringSoonWidget } from './widgets/expiring-soon-widget';
import { PendingLeaveWidget } from './widgets/pending-leave-widget';
import { TodaysRosterWidget } from './widgets/todays-roster-widget';
import { UnpaidTipsWidget } from './widgets/unpaid-tips-widget';
import { ReconciliationAlertsWidget } from './widgets/reconciliation-alerts-widget';
import { IncompleteChecklistsWidget } from './widgets/incomplete-checklists-widget';
import { MyTipBalanceWidget } from './widgets/my-tip-balance-widget';
import { TodaysChecklistWidget } from './widgets/todays-checklist-widget';
import { OperationsStatus } from './operations-status';
import { Analytics } from './analytics';

// Each widget is self-contained: it checks its own permission (or, for the
// two self-service ones, none at all — pinned regardless, same as their
// nav items) and renders null if it has nothing to show. A widget's own
// fetch failure is caught inside it, so one module having a bad day never
// takes the rest of the dashboard down with it.
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const me = await getMe();
  const firstName = me!.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 right-24 size-40 rounded-full bg-white/10"
        />
        <p className="relative text-sm font-medium text-white/80">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <h1 className="relative mt-1 text-3xl font-semibold tracking-tight">
          {greeting()}, {firstName}!
        </h1>
        <p className="relative mt-1 text-sm text-white/80">
          Here&apos;s what&apos;s happening across your branch today.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MyTipBalanceWidget />
        <TodaysChecklistWidget />
        <LowStockWidget me={me!} />
        <ExpiringSoonWidget me={me!} />
        <PendingLeaveWidget me={me!} />
        <TodaysRosterWidget me={me!} />
        <UnpaidTipsWidget me={me!} />
        <ReconciliationAlertsWidget me={me!} />
        <IncompleteChecklistsWidget me={me!} />
      </div>
      <Analytics me={me!} />
      <OperationsStatus me={me!} />
    </div>
  );
}
