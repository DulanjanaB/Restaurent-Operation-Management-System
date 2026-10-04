import { CalendarRange, CheckCircle2, FilePen } from 'lucide-react';
import { getMe } from '@/lib/auth/dal';
import { getRosterPeriods } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { PeriodCreateDialog } from './period-create-dialog';
import { PeriodsTable } from './periods-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function RosterPeriodsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const periods = await getRosterPeriods(branchId);
  const canCreate = hasPermission(me, 'roster.create');
  const canManage =
    hasPermission(me, 'roster.update') && hasPermission(me, 'roster.delete');
  const published = periods.filter(
    (period) => period.status === 'published',
  ).length;
  const drafts = periods.length - published;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 p-6 text-white shadow-lg">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            tone="teal"
            title={<>Roster periods</>}
            description={
              <>Weekly or monthly schedules for your current branch.</>
            }
          />
          {canCreate && <PeriodCreateDialog branchId={branchId} />}
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <CalendarRange className="size-4 text-white/80" />
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {periods.length}
            </p>
            <p className="text-xs text-white/80">Total</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <FilePen className="size-4 text-amber-200" />
            <p className="mt-1 text-2xl font-semibold tabular-nums">{drafts}</p>
            <p className="text-xs text-white/80">Drafts</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <CheckCircle2 className="size-4 text-emerald-200" />
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {published}
            </p>
            <p className="text-xs text-white/80">Published</p>
          </div>
        </div>
      </div>

      <PeriodsTable periods={periods} canManage={canManage} />
    </div>
  );
}
