import Link from 'next/link';
import { getMyChecklistRecords } from '@/lib/server/checklist/queries';
import { ApiError } from '@/lib/api/client';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import type {
  ChecklistRecord,
  ChecklistRecordStatus,
} from '@/lib/server/checklist/types';
import { PageHeader } from '@/components/shared/page-header';

const STATUS_LABELS: Record<
  ChecklistRecordStatus,
  { label: string; tone: StatusTone }
> = {
  pending: { label: 'Pending', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function TodaysChecklistPage() {
  let records: ChecklistRecord[];
  try {
    records = await getMyChecklistRecords({ date: today() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          title="No employee record linked"
          description="Your user account isn't linked to an employee record, so there's no checklist to show."
        />
      );
    }
    throw error;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader
        tone="emerald"
        title={<>Today&apos;s Checklist</>}
        description={<>Checklists assigned to you for {today()}.</>}
      />

      {records.length === 0 ? (
        <EmptyState
          title="Nothing assigned to you today"
          description="If you expect a checklist here, ask your manager to check your assignment."
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {records.map((record) => (
            <li key={record.id}>
              <Link
                href={`/checklist/today/${record.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {record.checklist_template?.name ?? 'Checklist'}
                  </p>
                  {record.checklist_template?.area && (
                    <p className="text-sm text-muted-foreground">
                      {record.checklist_template.area}
                    </p>
                  )}
                </div>
                <StatusBadge
                  status={record.status}
                  resolve={(value) =>
                    STATUS_LABELS[value as ChecklistRecordStatus]
                  }
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
