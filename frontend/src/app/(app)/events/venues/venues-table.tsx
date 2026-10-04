'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { VenueFormDialog } from './venue-form-dialog';
import { deleteVenue } from '@/lib/server/events/actions';
import type { Venue } from '@/lib/server/events/types';

export function VenuesTable({
  venues,
  branchId,
  canManage,
}: {
  venues: Venue[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Venue, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'capacity', header: 'Capacity' },
      { accessorKey: 'description', header: 'Description' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Venue } }) => (
                <div className="flex justify-end gap-2">
                  <VenueFormDialog venue={row.original} branchId={branchId} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteVenue(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Venue, unknown>,
          ]
        : []),
    ],
    [branchId, canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={venues}
      searchKey="name"
      searchPlaceholder="Search venues…"
      emptyTitle="No venues yet"
    />
  );
}
