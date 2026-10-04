import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import {
  getItems,
  getPurchaseOrder,
  getWarehouses,
} from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PoActions } from './po-actions';
import { ReceiveDialog } from './receive-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { Money } from '@/components/shared/money';

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let order;
  try {
    order = await getPurchaseOrder(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [items, warehouses] = await Promise.all([
    getItems(),
    getWarehouses(order.branch_id),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const canManage = hasPermission(me, 'inventory.manage_purchase_orders');
  const canApprove = hasPermission(me, 'inventory.approve');
  const canReceive =
    canManage &&
    (order.status === 'approved' || order.status === 'partially_received');

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="amber"
        title={<>{order.supplier?.name ?? order.supplier_id}</>}
        description={<>Ordered {order.order_date}</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3">
              <Badge className="capitalize">
                {order.status.replace('_', ' ')}
              </Badge>
              <PoActions
                orderId={order.id}
                status={order.status}
                canManage={canManage}
                canApprove={canApprove}
              />
              {canReceive && order.items && (
                <ReceiveDialog
                  orderId={order.id}
                  lines={order.items}
                  itemsById={itemsById}
                  warehouses={warehouses}
                />
              )}
            </div>
          </div>
        }
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Items</h2>
        {!order.items || order.items.length === 0 ? (
          <EmptyState title="No items on this order" />
        ) : (
          <ul className="divide-y rounded-md border">
            {order.items.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {itemsById.get(line.item_id)?.name ?? line.item_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {line.quantity_received} / {line.quantity_ordered} received
                    @ <Money value={line.unit_price} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
