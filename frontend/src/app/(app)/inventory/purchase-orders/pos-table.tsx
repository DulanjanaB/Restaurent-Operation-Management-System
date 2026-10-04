'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '@/lib/server/inventory/types';

const STATUS_TONE: Record<
  PurchaseOrderStatus,
  'secondary' | 'outline' | 'destructive'
> = {
  draft: 'outline',
  submitted: 'outline',
  approved: 'secondary',
  partially_received: 'secondary',
  received: 'secondary',
  cancelled: 'destructive',
};

export function PosTable({ orders }: { orders: PurchaseOrder[] }) {
  const columns = useMemo<ColumnDef<PurchaseOrder, unknown>[]>(
    () => [
      {
        id: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => (
          <Link
            href={`/inventory/purchase-orders/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.supplier?.name ?? row.original.supplier_id}
          </Link>
        ),
      },
      { accessorKey: 'order_date', header: 'Order Date' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={STATUS_TONE[row.original.status]}
            className="capitalize"
          >
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={orders}
      emptyTitle="No purchase orders yet"
    />
  );
}
