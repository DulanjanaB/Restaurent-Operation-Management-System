'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ApprovalQueue } from '@/components/shared/approval-queue';
import { Badge } from '@/components/ui/badge';
import { decideItemRequest } from '@/lib/server/inventory/actions';
import type { ItemRequest } from '@/lib/server/inventory/types';
import { summarizeLines } from './item-request-summary';

export function DecisionQueue({ requests }: { requests: ItemRequest[] }) {
  const columns = useMemo<ColumnDef<ItemRequest, unknown>[]>(
    () => [
      {
        id: 'requester',
        header: 'Requested by',
        accessorFn: (row) => row.requester?.name ?? row.requested_by,
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        accessorFn: (row) => row.warehouse?.name ?? row.warehouse_id,
      },
      {
        id: 'lines',
        header: 'Items',
        accessorFn: (row) => summarizeLines(row.items),
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
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
      onApprove={(id) => decideItemRequest(id, 'approve')}
      onReject={(id) => decideItemRequest(id, 'reject')}
    />
  );
}
