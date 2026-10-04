'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { EventTypeFormDialog } from './event-type-form-dialog';
import { deleteEventType } from '@/lib/server/events/actions';
import type { EventType } from '@/lib/server/events/types';

export function EventTypesTable({
  eventTypes,
  canManage,
}: {
  eventTypes: EventType[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<EventType, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'description', header: 'Description' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: EventType } }) => (
                <div className="flex justify-end gap-2">
                  <EventTypeFormDialog eventType={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteEventType(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<EventType, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={eventTypes}
      searchKey="name"
      searchPlaceholder="Search event types…"
      emptyTitle="No event types yet"
    />
  );
}
