'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusStepper } from '@/components/shared/status-stepper';
import { DeleteButton } from '@/components/shared/delete-button';
import { Button } from '@/components/ui/button';
import { deleteTipPool } from '@/lib/server/tip-sharing/actions';
import type { TipPool } from '@/lib/server/tip-sharing/types';
import { EditPoolDialog } from './edit-pool-dialog';
import { Money } from '@/components/shared/money';

const STEPS = [
  { key: 'open', label: 'Open' },
  { key: 'calculated', label: 'Calculated' },
];

export function PoolsTable({
  pools,
  canUpdate,
  canDelete,
}: {
  pools: TipPool[];
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const columns = useMemo<ColumnDef<TipPool, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <Link
            href={`/tip-sharing/pools/${row.original.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.date}
          </Link>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            <Money value={row.original.total_amount} />
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusStepper steps={STEPS} current={row.original.status} />
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const pool = row.original;
          const open = pool.status === 'open';
          return (
            <div className="flex items-center justify-end gap-2">
              <Button asChild size="sm" variant="ghost">
                <Link href={`/tip-sharing/pools/${pool.id}`}>
                  <Eye className="size-3.5" />
                  View
                </Link>
              </Button>
              {canUpdate && open && (
                <EditPoolDialog
                  poolId={pool.id}
                  date={pool.date}
                  totalAmount={pool.total_amount}
                />
              )}
              {canDelete && open && (
                <DeleteButton
                  itemLabel={`the ${pool.date} pool`}
                  onDelete={() => deleteTipPool(pool.id)}
                />
              )}
            </div>
          );
        },
      } satisfies ColumnDef<TipPool, unknown>,
    ],
    [canUpdate, canDelete],
  );

  return (
    <DataTable columns={columns} data={pools} emptyTitle="No tip pools yet" />
  );
}
