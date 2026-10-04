'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { StorageLocationFormDialog } from './storage-location-form-dialog';
import { deleteStorageLocation } from '@/lib/server/food-preservation/actions';
import type { StorageLocation } from '@/lib/server/food-preservation/types';

export function StorageLocationsTable({
  locations,
  branchId,
  canManage,
}: {
  locations: StorageLocation[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<StorageLocation, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/food-preservation/storage-locations/${row.original.id}`}
            className="underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.type.replace('_', ' ')}
          </span>
        ),
      },
      {
        id: 'range',
        header: 'Target Range (°C)',
        cell: ({ row }) =>
          row.original.target_temp_min != null ||
          row.original.target_temp_max != null
            ? `${row.original.target_temp_min ?? '–'} to ${row.original.target_temp_max ?? '–'}`
            : '—',
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: StorageLocation } }) => (
                <div className="flex justify-end gap-2">
                  <StorageLocationFormDialog
                    location={row.original}
                    branchId={branchId}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteStorageLocation(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<StorageLocation, unknown>,
          ]
        : []),
    ],
    [branchId, canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={locations}
      searchKey="name"
      searchPlaceholder="Search storage locations…"
      emptyTitle="No storage locations yet"
    />
  );
}
