'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type { ItemRequest } from '@/lib/server/inventory/types';
import { summarizeLines } from './item-request-summary';

export function MyRequestsTable({ requests }: { requests: ItemRequest[] }) {
  const columns = useMemo<ColumnDef<ItemRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
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
    <DataTable
      columns={columns}
      data={requests}
      emptyTitle="No requests yet"
      emptyDescription="Use New request to ask the store for items."
    />
  );
}
