'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ApprovalQueue } from '@/components/shared/approval-queue';
import { Badge } from '@/components/ui/badge';
import { decideWastage } from '@/lib/server/inventory/actions';
import type { Wastage } from '@/lib/server/inventory/types';

export function WastageQueue({
  requests,
  canDecide,
}: {
  requests: Wastage[];
  canDecide: boolean;
}) {
  const columns = useMemo<ColumnDef<Wastage, unknown>[]>(
    () => [
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row) => row.item?.name ?? row.item_id,
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        accessorFn: (row) => row.warehouse?.name ?? row.warehouse_id,
      },
      { accessorKey: 'quantity', header: 'Quantity' },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.reason}
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
      onApprove={(id) => decideWastage(id, 'approve')}
      onReject={(id) => decideWastage(id, 'reject')}
    />
  );
}
