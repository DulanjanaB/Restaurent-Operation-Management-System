'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { ShiftTemplateFormDialog } from './shift-template-form-dialog';
import { deleteShiftTemplate } from '@/lib/server/roster/actions';
import type { ShiftTemplate } from '@/lib/server/roster/types';

export function ShiftTemplatesTable({
  templates,
  branchId,
  canManage,
}: {
  templates: ShiftTemplate[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<ShiftTemplate, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'start_time', header: 'Start' },
      { accessorKey: 'end_time', header: 'End' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: ShiftTemplate } }) => (
                <div className="flex justify-end gap-2">
                  <ShiftTemplateFormDialog
                    template={row.original}
                    branchId={branchId}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteShiftTemplate(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<ShiftTemplate, unknown>,
          ]
        : []),
    ],
    [canManage, branchId],
  );

  return (
    <DataTable
      columns={columns}
      data={templates}
      searchKey="name"
      searchPlaceholder="Search shift templates…"
      emptyTitle="No shift templates yet"
    />
  );
}
