'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { Badge } from '@/components/ui/badge';
import { WarehouseFormDialog } from './warehouse-form-dialog';
import { deleteWarehouse } from '@/lib/server/inventory/actions';
import type { Warehouse } from '@/lib/server/inventory/types';

export function WarehousesTable({
  warehouses,
  branchId,
  canManage,
}: {
  warehouses: Warehouse[];
  branchId: string;
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<Warehouse, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.original.type}
          </Badge>
        ),
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Warehouse } }) => (
                <div className="flex justify-end gap-2">
                  <WarehouseFormDialog
                    warehouse={row.original}
                    branchId={branchId}
                  />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteWarehouse(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<Warehouse, unknown>,
          ]
        : []),
    ],
    [canManage, branchId],
  );

  return (
    <DataTable
      columns={columns}
      data={warehouses}
      searchKey="name"
      searchPlaceholder="Search warehouses…"
      emptyTitle="No warehouses yet"
    />
  );
}
