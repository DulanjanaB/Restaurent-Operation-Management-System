'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import type { BarStockCount } from '@/lib/server/bar/types';

export function CountsTable({
  counts,
  items,
  warehouses,
}: {
  counts: BarStockCount[];
  items: Item[];
  warehouses: Warehouse[];
}) {
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const warehousesById = useMemo(
    () => new Map(warehouses.map((warehouse) => [warehouse.id, warehouse])),
    [warehouses],
  );

  const columns = useMemo<ColumnDef<BarStockCount, unknown>[]>(
    () => [
      { accessorKey: 'counted_at', header: 'Date' },
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row) => itemsById.get(row.item_id)?.name ?? row.item_id,
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        accessorFn: (row) =>
          warehousesById.get(row.warehouse_id)?.name ?? row.warehouse_id,
      },
      { accessorKey: 'counted_quantity', header: 'Counted Quantity' },
    ],
    [itemsById, warehousesById],
  );

  return (
    <DataTable
      columns={columns}
      data={counts}
      emptyTitle="No stock counts recorded yet"
    />
  );
}
