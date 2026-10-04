'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { DepartmentFormDialog } from './department-form-dialog';
import { deleteDepartment } from '@/lib/server/roster/actions';
import type { Department } from '@/lib/server/roster/types';

export function DepartmentsTable({
  departments,
  branchId,
  canManage,
}: {
  departments: Department[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Department, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Department } }) => (
                <div className="flex justify-end gap-2">
                  <DepartmentFormDialog
                    department={row.original}
                    branchId={branchId}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteDepartment(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Department, unknown>,
          ]
        : []),
    ],
    [canManage, branchId],
  );

  return (
    <DataTable
      columns={columns}
      data={departments}
      searchKey="name"
      searchPlaceholder="Search departments…"
      emptyTitle="No departments yet"
    />
  );
}
