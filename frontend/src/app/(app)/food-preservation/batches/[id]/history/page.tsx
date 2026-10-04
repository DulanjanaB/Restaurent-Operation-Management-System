import { notFound } from 'next/navigation';
import { History } from 'lucide-react';
import {
  getBatch,
  getBatchTimeline,
} from '@/lib/server/food-preservation/queries';
import { ApiError } from '@/lib/api/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';

const DOT: Record<string, string> = {
  sky: 'bg-sky-500 ring-sky-200',
  emerald: 'bg-emerald-500 ring-emerald-200',
  amber: 'bg-amber-500 ring-amber-200',
  rose: 'bg-rose-500 ring-rose-200',
  teal: 'bg-teal-500 ring-teal-200',
  slate: 'bg-slate-400 ring-slate-200',
  violet: 'bg-violet-500 ring-violet-200',
};

export default async function BatchHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let batch;
  let events;
  try {
    [batch, events] = await Promise.all([getBatch(id), getBatchTimeline(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="sky"
        icon={History}
        title={<>History · {batch.batch_code}</>}
        description={
          <>Everything that has happened to this batch, oldest first.</>
        }
      />

      {events.length === 0 ? (
        <EmptyState title="No history yet" />
      ) : (
        <ol className="relative ml-3 space-y-6 border-l-2 border-slate-200 pl-8">
          {events.map((event, index) => (
            <li key={`${event.at}-${index}`} className="relative">
              <span
                className={cn(
                  'absolute -left-[41px] top-1 size-4 rounded-full ring-4',
                  DOT[event.tone] ?? DOT.slate,
                )}
              />
              <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{event.title}</p>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={event.at}
                  >
                    {new Date(event.at).toLocaleString()}
                  </time>
                </div>
                {event.detail && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.detail}
                  </p>
                )}
                {event.actor && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    by {event.actor}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
