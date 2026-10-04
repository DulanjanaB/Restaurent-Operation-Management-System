'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import type { BarSale } from '@/lib/server/bar/types';
import { Money } from '@/components/shared/money';

export function HistoryTable({ sales }: { sales: BarSale[] }) {
  const columns = useMemo<ColumnDef<BarSale, unknown>[]>(
    () => [
      {
        accessorKey: 'sold_at',
        header: 'When',
        cell: ({ row }) => new Date(row.original.sold_at).toLocaleString(),
      },
      {
        id: 'recipe',
        header: 'Drink',
        accessorFn: (row) => row.recipe?.name ?? row.recipe_id,
      },
      { accessorKey: 'quantity', header: 'Qty' },
      {
        accessorKey: 'unit_price',
        header: 'Unit Price',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
      {
        accessorKey: 'total_amount',
        header: 'Total',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={sales}
      searchKey="recipe"
      searchPlaceholder="Search by drink…"
      emptyTitle="No sales recorded yet"
    />
  );
}
