'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import type { AppUser } from '@/lib/server/administration/types';

export function UsersTable({ users }: { users: AppUser[] }) {
  const columns = useMemo<ColumnDef<AppUser, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/administration/users/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'username', header: 'Username' },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'branch',
        header: 'Primary branch',
        cell: ({ row }) => row.original.primary_branch?.name ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            resolve={(status) =>
              status === 'active'
                ? { label: 'Active', tone: 'success' }
                : { label: 'Inactive', tone: 'default' }
            }
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="name"
      searchPlaceholder="Search users…"
    />
  );
}
