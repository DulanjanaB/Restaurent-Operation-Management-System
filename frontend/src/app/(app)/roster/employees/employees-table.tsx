'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import type { Employee, EmployeeStatus } from '@/lib/server/roster/types';

export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const columns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/roster/employees/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'employee_code', header: 'Code' },
      {
        id: 'position',
        header: 'Position',
        cell: ({ row }) => row.original.position?.name ?? '—',
      },
      {
        id: 'department',
        header: 'Department',
        cell: ({ row }) => row.original.department?.name ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            resolve={(status) => {
              const map: Record<
                EmployeeStatus,
                { label: string; tone: 'success' | 'warning' | 'default' }
              > = {
                active: { label: 'Active', tone: 'success' },
                inactive: { label: 'Inactive', tone: 'default' },
                terminated: { label: 'Terminated', tone: 'warning' },
              };
              return map[status as EmployeeStatus];
            }}
          />
        ),
      },
      {
        id: 'login',
        header: 'Login',
        cell: ({ row }) =>
          row.original.user_id ? (
            <Badge variant="secondary">Has login</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              No login
            </Badge>
          ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={employees}
      searchKey="name"
      searchPlaceholder="Search employees…"
    />
  );
}
