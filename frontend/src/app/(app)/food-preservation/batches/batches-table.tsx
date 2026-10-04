'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { BatchStatusBadge } from './batch-status-badge';
import type { Batch } from '@/lib/server/food-preservation/types';
import { DayChip } from '@/components/shared/day-chip';

export function BatchesTable({ batches }: { batches: Batch[] }) {
  const columns = useMemo<ColumnDef<Batch, unknown>[]>(
    () => [
      {
        accessorKey: 'batch_code',
        header: 'Batch Code',
        cell: ({ row }) => (
          <Link
            href={`/food-preservation/batches/${row.original.id}`}
            className="font-medium underline"
          >
            {row.original.batch_code}
          </Link>
        ),
      },
      {
        id: 'preserved_item',
        header: 'Item',
        accessorFn: (row) => row.preserved_item?.name ?? row.preserved_item_id,
      },
      {
        id: 'storage_location',
        header: 'Location',
        accessorFn: (row) =>
          row.storage_location?.name ?? row.storage_location_id,
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
      },
      {
        id: 'preparers',
        header: 'Prepared By',
        accessorFn: (row) =>
          (row.preparers ?? []).map((p) => p.name).join(', '),
      },
      {
        id: 'day',
        header: 'Made On',
        cell: ({ row }) => (
          <DayChip
            day={row.original.production_day}
            color={row.original.day_color}
          />
        ),
      },
      { accessorKey: 'expiry_date', header: 'Expiry Date' },
      {
        id: 'history',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/food-preservation/batches/${row.original.id}/history`}
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            History
          </Link>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <BatchStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={batches}
      searchKey="batch_code"
      searchPlaceholder="Search by batch code…"
      emptyTitle="No batches yet"
    />
  );
}
