'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteRoleButton } from './delete-role-button';
import type { Role } from '@/lib/server/administration/types';

export function RolesTable({
  roles,
  canDelete,
}: {
  roles: Role[];
  canDelete: boolean;
}) {
  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/administration/roles/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'description', header: 'Description' },
      {
        id: 'system',
        header: '',
        cell: ({ row }) =>
          row.original.is_system_role ? (
            <Badge variant="secondary">System role</Badge>
          ) : null,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/administration/roles/${row.original.id}`}>
                Manage
              </Link>
            </Button>
            {canDelete && !row.original.is_system_role && (
              <DeleteRoleButton roleId={row.original.id} />
            )}
          </div>
        ),
      },
    ],
    [canDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={roles}
      searchKey="name"
      searchPlaceholder="Search roles…"
      emptyTitle="No roles yet"
    />
  );
}
