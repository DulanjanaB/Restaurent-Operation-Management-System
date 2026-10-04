'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { PayoutButton } from './payout-button';
import { Money } from '@/components/shared/money';

interface Row {
  employeeId: string;
  name: string;
  employeeCode: string;
  balance: string;
}

export function BalancesTable({
  rows,
  canPayout,
}: {
  rows: Row[];
  canPayout: boolean;
}) {
  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Employee',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: 'employeeCode', header: 'Code' },
      {
        accessorKey: 'balance',
        header: 'Unpaid balance',
        cell: ({ row }) => {
          const unpaid = Number(row.original.balance) > 0;
          return (
            <span
              className={
                unpaid
                  ? 'rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'text-muted-foreground tabular-nums'
              }
            >
              <Money value={row.original.balance} />
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href={`/roster/employees/${row.original.employeeId}`}>
                <Eye className="size-3.5" />
                View
              </Link>
            </Button>
            {canPayout && Number(row.original.balance) > 0 && (
              <PayoutButton
                employeeId={row.original.employeeId}
                employeeName={row.original.name}
              />
            )}
          </div>
        ),
      } satisfies ColumnDef<Row, unknown>,
    ],
    [canPayout],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="name"
      searchPlaceholder="Search employees…"
      emptyTitle="No employees"
    />
  );
}
