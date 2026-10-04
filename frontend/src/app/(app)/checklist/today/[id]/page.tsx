import { notFound } from 'next/navigation';
import { getChecklistRecord } from '@/lib/server/checklist/queries';
import { ApiError } from '@/lib/api/client';
import { RecordDetailView } from '../../record-detail-view';

export default async function TodaysChecklistRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let record;
  try {
    record = await getChecklistRecord(id);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    )
      notFound();
    throw error;
  }

  return <RecordDetailView record={record} canAnswer />;
}
