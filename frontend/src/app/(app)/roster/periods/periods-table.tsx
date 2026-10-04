'use client';

import Link from 'next/link';
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  FilePen,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { DeleteButton } from '@/components/shared/delete-button';
import { cn } from '@/lib/utils';
import { EditPeriodDialog } from './edit-period-dialog';
import { deleteRosterPeriod } from '@/lib/server/roster/actions';
import type { RosterPeriod } from '@/lib/server/roster/types';

const TYPE_STYLE: Record<string, string> = {
  weekly:
    'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  monthly:
    'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
};

function dayCount(start: string, end: string): number {
  const ms =
    new Date(`${end}T00:00:00`).getTime() -
    new Date(`${start}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function PeriodsTable({
  periods,
  canManage,
}: {
  periods: RosterPeriod[];
  canManage: boolean;
}) {
  if (periods.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 shadow-sm ring-1 ring-foreground/5">
        <EmptyState title="No roster periods yet" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {periods.map((period) => {
        const published = period.status === 'published';
        return (
          <div
            key={period.id}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:shadow-lg',
            )}
          >
            <div
              aria-hidden
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                published
                  ? 'from-emerald-400 to-teal-500'
                  : 'from-amber-400 to-orange-500',
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  'flex size-11 items-center justify-center rounded-xl',
                  published
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
                )}
              >
                <CalendarRange className="size-5" />
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                  TYPE_STYLE[period.period_type] ??
                    'bg-muted text-muted-foreground ring-border',
                )}
              >
                {period.period_type}
              </span>
            </div>

            <Link href={`/roster/periods/${period.id}`} className="mt-4 block">
              <p className="text-lg font-semibold tracking-tight group-hover:underline">
                {period.start_date} → {period.end_date}
              </p>
              <p className="text-sm text-muted-foreground">
                {dayCount(period.start_date, period.end_date)} days
              </p>
            </Link>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  published
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
                )}
              >
                {published ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <FilePen className="size-3.5" />
                )}
                {published ? 'Published to staff' : 'Being prepared'}
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-5">
              {canManage && period.status === 'draft' ? (
                <div className="flex gap-2">
                  <EditPeriodDialog period={period} />
                  <DeleteButton
                    itemLabel={`${period.start_date} – ${period.end_date}`}
                    onDelete={() => deleteRosterPeriod(period.id)}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {published ? 'Locked after publishing' : ''}
                </span>
              )}
              <Link
                href={`/roster/periods/${period.id}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
