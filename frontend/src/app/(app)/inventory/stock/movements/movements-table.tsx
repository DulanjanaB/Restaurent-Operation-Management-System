'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type {
  Item,
  StockMovement,
  Warehouse,
} from '@/lib/server/inventory/types';

export function MovementsTable({
  movements,
  items,
  warehouses,
}: {
  movements: StockMovement[];
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

  const columns = useMemo<ColumnDef<StockMovement, unknown>[]>(
    () => [
      {
        accessorKey: 'occurred_at',
        header: 'When',
        cell: ({ row }) => new Date(row.original.occurred_at).toLocaleString(),
      },
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
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      { accessorKey: 'quantity', header: 'Quantity' },
      { accessorKey: 'reference_type', header: 'Reference' },
    ],
    [itemsById, warehousesById],
  );

  return (
    <DataTable
      columns={columns}
      data={movements}
      searchKey="item"
      searchPlaceholder="Search by item…"
      emptyTitle="No stock movements yet"
    />
  );
}
