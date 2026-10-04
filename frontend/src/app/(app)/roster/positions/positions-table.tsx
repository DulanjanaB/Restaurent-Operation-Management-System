'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { PositionFormDialog } from './position-form-dialog';
import { deletePosition } from '@/lib/server/roster/actions';
import type { Position } from '@/lib/server/roster/types';

export function PositionsTable({
  positions,
  canManage,
}: {
  positions: Position[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Position, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Position } }) => (
                <div className="flex justify-end gap-2">
                  <PositionFormDialog position={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deletePosition(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Position, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={positions}
      searchKey="name"
      searchPlaceholder="Search positions…"
      emptyTitle="No positions yet"
    />
  );
}
