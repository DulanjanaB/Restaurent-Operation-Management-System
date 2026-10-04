'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { CategoryFormDialog } from './category-form-dialog';
import { deleteCategory } from '@/lib/server/inventory/actions';
import type { Category } from '@/lib/server/inventory/types';

export function CategoriesTable({
  categories,
  canManage,
}: {
  categories: Category[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Category, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'description', header: 'Description' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Category } }) => (
                <div className="flex justify-end gap-2">
                  <CategoryFormDialog category={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteCategory(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Category, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={categories}
      searchKey="name"
      searchPlaceholder="Search categories…"
      emptyTitle="No categories yet"
    />
  );
}
