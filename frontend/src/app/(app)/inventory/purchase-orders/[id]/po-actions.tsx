'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  submitPurchaseOrder,
} from '@/lib/server/inventory/actions';
import type { PurchaseOrderStatus } from '@/lib/server/inventory/types';

export function PoActions({
  orderId,
  status,
  canManage,
  canApprove,
}: {
  orderId: string;
  status: PurchaseOrderStatus;
  canManage: boolean;
  canApprove: boolean;
}) {
  const canCancel =
    canManage &&
    status !== 'received' &&
    status !== 'partially_received' &&
    status !== 'cancelled';

  return (
    <div className="flex gap-2">
      {status === 'draft' && canManage && (
        <ConfirmDialog
          trigger={<Button size="sm">Submit</Button>}
          title="Submit this purchase order?"
          confirmLabel="Submit"
          onConfirm={() => submitPurchaseOrder(orderId)}
        />
      )}
      {status === 'submitted' && canApprove && (
        <ConfirmDialog
          trigger={<Button size="sm">Approve</Button>}
          title="Approve this purchase order?"
          confirmLabel="Approve"
          onConfirm={() => approvePurchaseOrder(orderId)}
        />
      )}
      {canCancel && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          }
          title="Cancel this purchase order?"
          confirmLabel="Cancel order"
          variant="destructive"
          onConfirm={() => cancelPurchaseOrder(orderId)}
        />
      )}
    </div>
  );
}
