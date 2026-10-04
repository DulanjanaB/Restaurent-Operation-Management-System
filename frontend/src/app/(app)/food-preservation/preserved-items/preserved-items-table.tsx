'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { PreservedItemFormDialog } from './preserved-item-form-dialog';
import { deletePreservedItem } from '@/lib/server/food-preservation/actions';
import type { PreservedItem } from '@/lib/server/food-preservation/types';

export function PreservedItemsTable({
  items,
  canManage,
}: {
  items: PreservedItem[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<PreservedItem, unknown>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'default_unit', header: 'Default Unit' },
      { accessorKey: 'category', header: 'Category' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: PreservedItem } }) => (
                <div className="flex justify-end gap-2">
                  <PreservedItemFormDialog item={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deletePreservedItem(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<PreservedItem, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="name"
      searchPlaceholder="Search preserved items…"
      emptyTitle="No preserved items yet"
    />
  );
}
