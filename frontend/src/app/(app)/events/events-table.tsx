'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { EventStatusBadge } from './event-status-badge';
import type { Event } from '@/lib/server/events/types';

export function EventsTable({ events }: { events: Event[] }) {
  const columns = useMemo<ColumnDef<Event, unknown>[]>(
    () => [
      {
        accessorKey: 'event_date',
        header: 'Date',
        cell: ({ row }) =>
          new Date(row.original.event_date).toLocaleDateString(),
      },
      {
        id: 'customer',
        header: 'Customer',
        accessorFn: (row) => row.customer?.name ?? row.customer_id,
      },
      {
        id: 'venue',
        header: 'Venue',
        accessorFn: (row) => row.venue?.name ?? row.venue_id,
      },
      {
        id: 'event_type',
        header: 'Type',
        accessorFn: (row) => row.event_type?.name ?? row.event_type_id,
      },
      { accessorKey: 'guest_count', header: 'Guests' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <EventStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/events/${row.original.id}`}
            className="text-sm font-medium underline"
          >
            View
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={events}
      searchKey="customer"
      searchPlaceholder="Search by customer…"
      emptyTitle="No events match these filters"
    />
  );
}
