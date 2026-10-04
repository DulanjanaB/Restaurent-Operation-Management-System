'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Stock, StockStatus } from '@/lib/server/inventory/types';

export function StockTable({ rows }: { rows: Stock[] }) {
  const columns = useMemo<ColumnDef<Stock, unknown>[]>(
    () => [
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row) => row.item?.name ?? row.item_id,
      },
      {
        id: 'sku',
        header: 'SKU',
        cell: ({ row }) => row.original.item?.sku ?? '—',
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) =>
          row.original.warehouse?.name ?? row.original.warehouse_id,
      },
      { accessorKey: 'quantity', header: 'Quantity' },
      { accessorKey: 'minimum_stock_level', header: 'Minimum' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            resolve={(status) => {
              const map: Record<
                StockStatus,
                { label: string; tone: 'success' | 'warning' | 'destructive' }
              > = {
                available: { label: 'Available', tone: 'success' },
                low_stock: { label: 'Low stock', tone: 'warning' },
                out_of_stock: { label: 'Out of stock', tone: 'destructive' },
              };
              return map[status as StockStatus];
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="item"
      emptyTitle="No stock records"
    />
  );
}
