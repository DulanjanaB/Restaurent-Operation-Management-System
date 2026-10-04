'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { PackageFormDialog } from './package-form-dialog';
import { deletePackage } from '@/lib/server/events/actions';
import type { EventPackage } from '@/lib/server/events/types';
import { Money } from '@/components/shared/money';

export function PackagesTable({
  packages,
  branchId,
  canManage,
}: {
  packages: EventPackage[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<EventPackage, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'price_per_guest',
        header: 'Per Guest',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
      {
        accessorKey: 'flat_price',
        header: 'Flat Price',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: EventPackage } }) => (
                <div className="flex justify-end gap-2">
                  <PackageFormDialog
                    eventPackage={row.original}
                    branchId={branchId}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deletePackage(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<EventPackage, unknown>,
          ]
        : []),
    ],
    [branchId, canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={packages}
      searchKey="name"
      searchPlaceholder="Search packages…"
      emptyTitle="No packages yet"
    />
  );
}
