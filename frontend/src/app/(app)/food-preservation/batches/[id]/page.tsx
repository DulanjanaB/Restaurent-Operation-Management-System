import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getBatch } from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { BatchStatusBadge } from '../batch-status-badge';
import { ConsumeButton } from './consume-button';
import { PageHeader } from '@/components/shared/page-header';
import { DayChip } from '@/components/shared/day-chip';
import { batchQrDataUrl } from '@/lib/food-preservation/batch-qr';
import Link from 'next/link';

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let batch;
  try {
    batch = await getBatch(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const qr = await batchQrDataUrl(batch.id);
  const canUpdateStatus = hasPermission(me, 'food_preservation.update_status');
  const canCreateDisposal = hasPermission(me, 'food_preservation.create');

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="sky"
        title={<>{batch.batch_code}</>}
        description={
          <>
            {batch.preserved_item?.name ?? batch.preserved_item_id} ·{' '}
            {batch.storage_location?.name ?? batch.storage_location_id}
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3">
              <BatchStatusBadge status={batch.status} />
              {batch.status === 'active' && canUpdateStatus && (
                <ConsumeButton batchId={batch.id} />
              )}
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QR code for this batch"
            className="size-28 rounded-md"
          />
          <div className="space-y-2">
            <DayChip day={batch.production_day} color={batch.day_color} />
            <p className="text-sm text-muted-foreground">
              Scan with the Batch Scanner app to see these details on a phone.
            </p>
          </div>
        </div>
        <Link
          href={`/food-preservation/batches/${batch.id}/history`}
          className="rounded-full border px-4 py-2 text-sm font-medium"
        >
          View history
        </Link>
        <Link
          href={`/food-preservation/batches/${batch.id}/sticker`}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm"
        >
          Print sticker
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Quantity</dt>
          <dd className="font-medium">
            {batch.quantity} {batch.unit}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Production date</dt>
          <dd className="font-medium">{batch.production_date}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Expiry date</dt>
          <dd className="font-medium">{batch.expiry_date}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Prepared by</dt>
          <dd className="font-medium">
            {(batch.preparers ?? []).map((p) => p.name).join(', ') || '—'}
          </dd>
        </div>
        {batch.notes && (
          <div className="col-span-2">
            <dt className="text-muted-foreground">Notes</dt>
            <dd>{batch.notes}</dd>
          </div>
        )}
      </dl>

      {(batch.status === 'active' || batch.status === 'expired') &&
        canCreateDisposal && (
          <p className="text-sm text-muted-foreground">
            Spoiled or need to write this off?{' '}
            <Link
              href="/food-preservation/waste-disposals"
              className="underline"
            >
              Request a waste disposal
            </Link>
            .
          </p>
        )}
    </div>
  );
}
