'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { Badge } from '@/components/ui/badge';
import { ItemFormDialog } from './item-form-dialog';
import { deleteItem } from '@/lib/server/inventory/actions';
import type { Category, Item, Unit } from '@/lib/server/inventory/types';

export function ItemsTable({
  items,
  categories,
  units,
  canManage,
}: {
  items: Item[];
  categories: Category[];
  units: Unit[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Item, unknown>[]>(
    () => [
      { accessorKey: 'sku', header: 'SKU' },
      { accessorKey: 'name', header: 'Name' },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category?.name ?? '—',
      },
      {
        id: 'unit',
        header: 'Unit',
        cell: ({ row }) => row.original.unit?.abbreviation ?? '—',
      },
      {
        id: 'track_expiry',
        header: 'Tracks expiry',
        cell: ({ row }) =>
          row.original.track_expiry ? (
            <Badge variant="secondary">Yes</Badge>
          ) : null,
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Item } }) => (
                <div className="flex justify-end gap-2">
                  <ItemFormDialog
                    item={row.original}
                    categories={categories}
                    units={units}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteItem(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Item, unknown>,
          ]
        : []),
    ],
    [canManage, categories, units],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="name"
      searchPlaceholder="Search items…"
      emptyTitle="No items yet"
    />
  );
}
