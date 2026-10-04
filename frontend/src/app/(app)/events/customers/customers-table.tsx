'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { CustomerFormDialog } from './customer-form-dialog';
import { deleteCustomer } from '@/lib/server/events/actions';
import type { Customer } from '@/lib/server/events/types';

export function CustomersTable({
  customers,
  canManage,
}: {
  customers: Customer[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'email', header: 'Email' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Customer } }) => (
                <div className="flex justify-end gap-2">
                  <CustomerFormDialog customer={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteCustomer(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Customer, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey="name"
      searchPlaceholder="Search customers…"
      emptyTitle="No customers yet"
    />
  );
}
