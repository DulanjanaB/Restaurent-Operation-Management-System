'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import type { Item, StockBatch } from '@/lib/server/inventory/types';

export function BatchesTable({
  batches,
  items,
}: {
  batches: StockBatch[];
  items: Item[];
}) {
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const columns = useMemo<ColumnDef<StockBatch, unknown>[]>(
    () => [
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row) => itemsById.get(row.item_id)?.name ?? row.item_id,
      },
      { accessorKey: 'batch_no', header: 'Batch No.' },
      { accessorKey: 'quantity', header: 'Quantity' },
      { accessorKey: 'expiry_date', header: 'Expiry Date' },
      { accessorKey: 'received_at', header: 'Received' },
    ],
    [itemsById],
  );

  return (
    <DataTable
      columns={columns}
      data={batches}
      searchKey="item"
      searchPlaceholder="Search by item…"
      emptyTitle="No batches yet"
    />
  );
}
