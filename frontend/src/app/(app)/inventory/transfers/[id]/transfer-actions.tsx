'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
} from '@/lib/server/inventory/actions';
import type { StockTransferStatus } from '@/lib/server/inventory/types';

export function TransferActions({
  transferId,
  status,
  canApprove,
  canTransfer,
}: {
  transferId: string;
  status: StockTransferStatus;
  canApprove: boolean;
  canTransfer: boolean;
}) {
  return (
    <div className="flex gap-2">
      {status === 'pending' && canApprove && (
        <ConfirmDialog
          trigger={<Button size="sm">Approve</Button>}
          title="Approve this transfer?"
          confirmLabel="Approve"
          onConfirm={() => approveTransfer(transferId)}
        />
      )}
      {status === 'approved' && canTransfer && (
        <ConfirmDialog
          trigger={<Button size="sm">Complete</Button>}
          title="Complete this transfer?"
          description="This moves the stock out of the source warehouse and into the destination warehouse."
          confirmLabel="Complete"
          onConfirm={() => completeTransfer(transferId)}
        />
      )}
      {(status === 'pending' || status === 'approved') && canTransfer && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          }
          title="Cancel this transfer?"
          confirmLabel="Cancel transfer"
          variant="destructive"
          onConfirm={() => cancelTransfer(transferId)}
        />
      )}
    </div>
  );
}
