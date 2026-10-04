import { notFound } from 'next/navigation';
import { getBatch } from '@/lib/server/food-preservation/queries';
import { batchQrDataUrl } from '@/lib/food-preservation/batch-qr';
import { ApiError } from '@/lib/api/client';
import { PrintButton } from '@/components/shared/print-button';
import Link from 'next/link';

// 62 × 40 mm label — the size most kitchen label printers use.
export default async function BatchStickerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let batch;
  try {
    batch = await getBatch(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const qr = await batchQrDataUrl(batch.id);
  const color = batch.day_color?.hex ?? '#94a3b8';

  return (
    <div className="space-y-6">
      <style>{'@page { size: 62mm 40mm; margin: 0; }'}</style>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/food-preservation/batches/${batch.id}`}
          className="text-sm font-medium text-primary underline"
        >
          Back to batch
        </Link>
        <PrintButton />
      </div>
      <p className="no-print text-sm text-muted-foreground">
        Print on a 62 × 40 mm label. In the print dialog set the scale to 100%
        and untick headers and footers.
      </p>

      <div className="mx-auto flex h-[40mm] w-[62mm] overflow-hidden border border-slate-300 bg-white text-slate-900 print:border-0">
        <div
          className="flex w-[4mm] shrink-0 flex-col justify-end"
          style={{ backgroundColor: color }}
        >
          <span className="origin-bottom-left -rotate-90 whitespace-nowrap pb-1 pl-[1.2mm] text-[2.2mm] font-bold uppercase tracking-wide text-white">
            {batch.production_day ?? ''}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-[2mm]">
          <div className="flex items-start justify-between gap-[1mm]">
            <div className="min-w-0">
              <p className="truncate text-[3mm] font-bold leading-tight">
                {batch.batch_code}
              </p>
              <p className="truncate text-[2.4mm] leading-tight">
                {batch.preserved_item?.name ?? ''}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt="QR code for this batch"
              className="size-[24mm] shrink-0"
            />
          </div>
          <div className="text-[2.1mm] leading-snug">
            <p>Made: {batch.production_date}</p>
            <p className="font-semibold">Use by: {batch.expiry_date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
