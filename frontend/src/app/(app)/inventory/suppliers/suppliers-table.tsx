'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { SupplierFormDialog } from './supplier-form-dialog';
import { deleteSupplier } from '@/lib/server/inventory/actions';
import type { Supplier } from '@/lib/server/inventory/types';

export function SuppliersTable({
  suppliers,
  canManage,
}: {
  suppliers: Supplier[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Supplier, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'contact_person', header: 'Contact' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'email', header: 'Email' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Supplier } }) => (
                <div className="flex justify-end gap-2">
                  <SupplierFormDialog supplier={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteSupplier(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Supplier, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={suppliers}
      searchKey="name"
      searchPlaceholder="Search suppliers…"
      emptyTitle="No suppliers yet"
    />
  );
}
