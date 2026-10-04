import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getTransfer } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { StatusStepper } from '@/components/shared/status-stepper';
import { EmptyState } from '@/components/shared/empty-state';
import { TransferActions } from './transfer-actions';
import { PageHeader } from '@/components/shared/page-header';

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let transfer;
  try {
    transfer = await getTransfer(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="amber"
        title={
          <>
            {transfer.from_warehouse?.name} → {transfer.to_warehouse?.name}
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3">
              <StatusStepper
                steps={STEPS}
                current={transfer.status}
                terminal={{ key: 'cancelled', label: 'Cancelled' }}
              />
              <TransferActions
                transferId={transfer.id}
                status={transfer.status}
                canApprove={hasPermission(me, 'inventory.approve')}
                canTransfer={hasPermission(me, 'inventory.transfer')}
              />
            </div>
          </div>
        }
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Items</h2>
        {!transfer.items || transfer.items.length === 0 ? (
          <EmptyState title="No items on this transfer" />
        ) : (
          <ul className="divide-y rounded-md border">
            {transfer.items.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <span>{line.item?.name ?? line.item_id}</span>
                <span className="font-medium">{line.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
