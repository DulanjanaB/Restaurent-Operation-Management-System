'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type { ChecklistTemplate } from '@/lib/server/checklist/types';

export function TemplatesTable({
  templates,
}: {
  templates: ChecklistTemplate[];
}) {
  const columns = useMemo<ColumnDef<ChecklistTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/checklist/templates/${row.original.id}`}
            className="font-medium underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'area', header: 'Area' },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'secondary' : 'outline'}>
            {row.original.is_active ? 'Active' : 'Archived'}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={templates}
      searchKey="name"
      searchPlaceholder="Search templates…"
      emptyTitle="No checklist templates yet"
    />
  );
}
