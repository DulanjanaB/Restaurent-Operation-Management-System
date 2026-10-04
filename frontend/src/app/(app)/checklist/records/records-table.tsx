'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import type {
  ChecklistRecord,
  ChecklistRecordStatus,
} from '@/lib/server/checklist/types';

const STATUS_LABELS: Record<
  ChecklistRecordStatus,
  { label: string; tone: StatusTone }
> = {
  pending: { label: 'Pending', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};

export function RecordsTable({ records }: { records: ChecklistRecord[] }) {
  const columns = useMemo<ColumnDef<ChecklistRecord, unknown>[]>(
    () => [
      { accessorKey: 'date', header: 'Date' },
      {
        id: 'template',
        header: 'Checklist',
        cell: ({ row }) => (
          <Link
            href={`/checklist/records/${row.original.id}`}
            className="underline"
          >
            {row.original.checklist_template?.name ??
              row.original.checklist_template_id}
          </Link>
        ),
      },
      {
        id: 'employee',
        header: 'Employee',
        accessorFn: (row) => row.employee?.name ?? row.employee_id,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            resolve={(value) => STATUS_LABELS[value as ChecklistRecordStatus]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={records}
      emptyTitle="No checklist records for this filter"
      emptyDescription="Pending records show up here too — not just completed ones."
    />
  );
}
