'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusStepper } from '@/components/shared/status-stepper';
import type { StockTransfer } from '@/lib/server/inventory/types';

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

export function TransfersTable({ transfers }: { transfers: StockTransfer[] }) {
  const columns = useMemo<ColumnDef<StockTransfer, unknown>[]>(
    () => [
      {
        id: 'route',
        header: 'Route',
        cell: ({ row }) => (
          <Link
            href={`/inventory/transfers/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.from_warehouse?.name ??
              row.original.from_warehouse_id}{' '}
            → {row.original.to_warehouse?.name ?? row.original.to_warehouse_id}
          </Link>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusStepper
            steps={STEPS}
            current={row.original.status}
            terminal={{ key: 'cancelled', label: 'Cancelled' }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={transfers}
      emptyTitle="No stock transfers yet"
    />
  );
}
