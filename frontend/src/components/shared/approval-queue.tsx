'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { ConfirmDialog } from './confirm-dialog';

// Generic pending -> approved/rejected list, reused verbatim across Food
// Preservation WasteDisposal, Inventory Wastage/Transfer/PurchaseOrder, and
// Roster Leave — each module supplies its own columns + approve/reject
// Server Actions bound to the row id.
export function ApprovalQueue<TData>({
  items,
  columns,
  getId,
  isPending,
  onApprove,
  onReject,
  canDecide = true,
}: {
  items: TData[];
  columns: ColumnDef<TData, unknown>[];
  getId: (item: TData) => string;
  isPending: (item: TData) => boolean;
  onApprove: (id: string) => Promise<{ error?: string } | void>;
  onReject: (id: string) => Promise<{ error?: string } | void>;
  // Set false to render the list read-only (e.g. viewer without the
  // module's `.approve` permission) — same data, no action buttons.
  canDecide?: boolean;
}) {
  const columnsWithActions: ColumnDef<TData, unknown>[] = canDecide
    ? [
        ...columns,
        {
          id: 'actions',
          header: '',
          cell: ({ row }) => {
            const item = row.original;
            if (!isPending(item)) return null;
            const id = getId(item);
            return (
              <div className="flex justify-end gap-2">
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Approve
                    </Button>
                  }
                  title="Approve this request?"
                  confirmLabel="Approve"
                  onConfirm={() => onApprove(id)}
                />
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                  }
                  title="Reject this request?"
                  confirmLabel="Reject"
                  variant="destructive"
                  onConfirm={() => onReject(id)}
                />
              </div>
            );
          },
        },
      ]
    : columns;

  return (
    <DataTable
      columns={columnsWithActions}
      data={items}
      emptyTitle="Nothing to review"
      emptyDescription="Approval requests will show up here."
    />
  );
}
