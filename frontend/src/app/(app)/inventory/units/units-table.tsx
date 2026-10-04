'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { UnitFormDialog } from './unit-form-dialog';
import { deleteUnit } from '@/lib/server/inventory/actions';
import type { Unit } from '@/lib/server/inventory/types';

export function UnitsTable({
  units,
  canManage,
}: {
  units: Unit[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Unit, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'abbreviation', header: 'Abbreviation' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Unit } }) => (
                <div className="flex justify-end gap-2">
                  <UnitFormDialog unit={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteUnit(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Unit, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={units}
      searchKey="name"
      searchPlaceholder="Search units…"
      emptyTitle="No units yet"
    />
  );
}
