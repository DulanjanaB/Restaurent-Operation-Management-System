'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ApprovalQueue } from '@/components/shared/approval-queue';
import { Badge } from '@/components/ui/badge';
import { decideWasteDisposal } from '@/lib/server/food-preservation/actions';
import type { WasteDisposal } from '@/lib/server/food-preservation/types';

export function WasteDisposalQueue({
  requests,
  canDecide,
}: {
  requests: WasteDisposal[];
  canDecide: boolean;
}) {
  const columns = useMemo<ColumnDef<WasteDisposal, unknown>[]>(
    () => [
      {
        id: 'batch',
        header: 'Batch',
        accessorFn: (row) => row.batch?.batch_code ?? row.batch_id,
      },
      { accessorKey: 'quantity', header: 'Quantity' },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.reason.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'approved'
                ? 'secondary'
                : row.original.status === 'rejected'
                  ? 'destructive'
                  : 'outline'
            }
            className="capitalize"
          >
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <ApprovalQueue
      items={requests}
      columns={columns}
      getId={(row) => row.id}
      isPending={(row) => row.status === 'pending'}
      canDecide={canDecide}
      onApprove={(id) => decideWasteDisposal(id, 'approve')}
      onReject={(id) => decideWasteDisposal(id, 'reject')}
    />
  );
}
