'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deactivateChecklistAssignment } from '@/lib/server/checklist/actions';
import type { ChecklistAssignment } from '@/lib/server/checklist/types';

export function AssignmentsTable({
  assignments,
  canManage,
}: {
  assignments: ChecklistAssignment[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<ChecklistAssignment, unknown>[]>(
    () => [
      {
        id: 'template',
        header: 'Template',
        accessorFn: (row) =>
          row.checklist_template?.name ?? row.checklist_template_id,
      },
      {
        id: 'employee',
        header: 'Employee',
        accessorFn: (row) => row.employee?.name ?? row.employee_id,
      },
      { accessorKey: 'start_date', header: 'Start' },
      { accessorKey: 'end_date', header: 'End' },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.active ? 'secondary' : 'outline'}>
            {row.original.active ? 'Active' : 'Deactivated'}
          </Badge>
        ),
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: ChecklistAssignment } }) =>
                row.original.active ? (
                  <div className="flex justify-end">
                    <ConfirmDialog
                      trigger={
                        <Button size="sm" variant="outline">
                          Deactivate
                        </Button>
                      }
                      title="Deactivate this assignment?"
                      description="Stops generating new daily checklist records for this employee. Past records are kept."
                      onConfirm={() =>
                        deactivateChecklistAssignment(row.original.id)
                      }
                    />
                  </div>
                ) : null,
            } satisfies ColumnDef<ChecklistAssignment, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={assignments}
      emptyTitle="No checklist assignments yet"
    />
  );
}
