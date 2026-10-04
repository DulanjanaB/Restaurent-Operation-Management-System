import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import {
  getStorageLocation,
  getStorageLogs,
} from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { LogStorageForm } from './log-storage-form';
import { StorageLogsTable } from './storage-logs-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StorageLocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let location;
  try {
    location = await getStorageLocation(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const logs = await getStorageLogs(id);
  const canLog = hasPermission(me, 'food_preservation.log_storage');

  return (
    <div className="space-y-6">
      <PageHeader
        tone="sky"
        title={<>{location.name}</>}
        description={
          <>
            <span className="capitalize">
              {location.type.replace('_', ' ')}
            </span>
            {(location.target_temp_min != null ||
              location.target_temp_max != null) && (
              <>
                {' '}
                · Target range: {location.target_temp_min ?? '–'}°C to{' '}
                {location.target_temp_max ?? '–'}°C
              </>
            )}
          </>
        }
      />

      {canLog && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Log a check
          </h2>
          <LogStorageForm storageLocationId={id} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          History
        </h2>
        <StorageLogsTable logs={logs} />
      </div>
    </div>
  );
}
