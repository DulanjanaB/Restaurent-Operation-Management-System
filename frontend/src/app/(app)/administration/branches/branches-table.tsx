'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { BranchFormDialog } from './branch-form-dialog';
import type { Branch } from '@/lib/server/administration/types';

// ColumnDef.cell render functions contain JSX closures, which can't cross
// the Server -> Client Component boundary as props (only serializable data
// can). So the columns array is built here, inside the client component
// that actually renders <DataTable>, not in the Server Component page —
// same pattern every future module's list screen should follow.
export function BranchesTable({
  branches,
  canUpdate,
}: {
  branches: Branch[];
  canUpdate: boolean;
}) {
  const columns = useMemo<ColumnDef<Branch, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'address', header: 'Address' },
      { accessorKey: 'phone', header: 'Phone' },
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
      ...(canUpdate
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Branch } }) => (
                <div className="flex justify-end">
                  <BranchFormDialog branch={row.original} />
                </div>
              ),
            } satisfies ColumnDef<Branch, unknown>,
          ]
        : []),
    ],
    [canUpdate],
  );

  return (
    <DataTable
      columns={columns}
      data={branches}
      searchKey="name"
      searchPlaceholder="Search branches…"
      emptyTitle="No branches yet"
      emptyDescription="Create your first branch to get started."
    />
  );
}
