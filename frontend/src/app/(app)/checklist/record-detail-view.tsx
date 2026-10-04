import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import { AnswerItemRow } from './answer-item-row';
import type {
  ChecklistRecordDetail,
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

export function RecordDetailView({
  record,
  canAnswer,
}: {
  record: ChecklistRecordDetail;
  canAnswer: boolean;
}) {
  const responsesByItem = new Map(
    record.responses.map((response) => [response.checklist_item_id, response]),
  );
  const sortedItems = [...record.items].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="emerald"
        title={<>Checklist — {record.date}</>}
        description={
          <>
            {record.responses.length} of {record.items.length} items answered
          </>
        }
        action={
          <StatusBadge
            status={record.status}
            resolve={(value) => STATUS_LABELS[value as ChecklistRecordStatus]}
          />
        }
      />

      <ul className="divide-y rounded-md border">
        {sortedItems.map((item) => (
          <AnswerItemRow
            key={item.id}
            recordId={record.id}
            item={item}
            response={responsesByItem.get(item.id)}
            canAnswer={canAnswer}
          />
        ))}
      </ul>
    </div>
  );
}
