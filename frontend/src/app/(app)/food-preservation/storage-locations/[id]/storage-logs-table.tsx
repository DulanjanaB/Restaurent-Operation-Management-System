'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { cn } from '@/lib/utils';
import type { StorageLog } from '@/lib/server/food-preservation/types';

export function StorageLogsTable({ logs }: { logs: StorageLog[] }) {
  const columns = useMemo<ColumnDef<StorageLog, unknown>[]>(
    () => [
      {
        accessorKey: 'recorded_at',
        header: 'When',
        cell: ({ row }) => new Date(row.original.recorded_at).toLocaleString(),
      },
      {
        accessorKey: 'temperature',
        header: 'Temperature (°C)',
        cell: ({ row }) => (
          <span
            className={cn(
              'flex items-center gap-1.5 font-medium',
              !row.original.in_range && 'text-destructive',
            )}
          >
            {!row.original.in_range && <AlertTriangle className="size-3.5" />}
            {row.original.temperature}
          </span>
        ),
      },
      { accessorKey: 'condition_notes', header: 'Condition notes' },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={logs}
      emptyTitle="No checks logged yet"
      emptyDescription="Out-of-range readings are flagged in red the moment they're logged."
    />
  );
}
