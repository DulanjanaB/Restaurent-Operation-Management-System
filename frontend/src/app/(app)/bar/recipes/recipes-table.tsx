'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import type { BarRecipe } from '@/lib/server/bar/types';
import { Money } from '@/components/shared/money';

export function RecipesTable({ recipes }: { recipes: BarRecipe[] }) {
  const columns = useMemo<ColumnDef<BarRecipe, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/bar/recipes/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'selling_price',
        header: 'Selling Price',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={recipes}
      searchKey="name"
      searchPlaceholder="Search recipes…"
      emptyTitle="No recipes yet"
    />
  );
}
