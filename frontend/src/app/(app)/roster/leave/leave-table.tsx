'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { DeleteButton } from '@/components/shared/delete-button';
import { deleteLeaveRequest } from '@/lib/server/roster/actions';
import type { Employee, Leave, LeaveStatus } from '@/lib/server/roster/types';

interface Row extends Leave {
  employeeName: string;
}

export function LeaveTable({
  requests,
  employeesById,
  canDelete,
}: {
  requests: Leave[];
  employeesById: Map<string, Employee>;
  canDelete: boolean;
}) {
  const rows: Row[] = requests.map((request) => ({
    ...request,
    employeeName: employeesById.get(request.employee_id)?.name ?? 'Unknown',
  }));

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      { accessorKey: 'employeeName', header: 'Employee' },
      { accessorKey: 'leave_type', header: 'Type' },
      { accessorKey: 'start_date', header: 'From' },
      { accessorKey: 'end_date', header: 'To' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            resolve={(status) => {
              const map: Record<
                LeaveStatus,
                { label: string; tone: 'success' | 'warning' | 'default' }
              > = {
                pending: { label: 'Pending', tone: 'warning' },
                approved: { label: 'Approved', tone: 'success' },
                rejected: { label: 'Rejected', tone: 'default' },
              };
              return map[status as LeaveStatus];
            }}
          />
        ),
      },
      ...(canDelete
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Row } }) => (
                <div className="flex justify-end">
                  <DeleteButton
                    itemLabel="this leave request"
                    onDelete={() => deleteLeaveRequest(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Row, unknown>,
          ]
        : []),
    ],
    [canDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="employeeName"
      searchPlaceholder="Search by employee…"
      emptyTitle="No leave requests"
    />
  );
}
