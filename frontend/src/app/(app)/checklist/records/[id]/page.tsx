import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getChecklistRecord } from '@/lib/server/checklist/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { RecordDetailView } from '../../record-detail-view';

export default async function ChecklistRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

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

  const canAnswer = hasPermission(me, 'checklist.complete');

  return <RecordDetailView record={record} canAnswer={canAnswer} />;
}
