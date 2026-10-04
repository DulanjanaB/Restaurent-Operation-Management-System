'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { receivePurchaseOrder } from '@/lib/server/inventory/actions';
import type { Item, PurchaseOrderItem } from '@/lib/server/inventory/types';
import type { Warehouse } from '@/lib/server/inventory/types';

interface LineState {
  quantityReceived: string;
  batchNo: string;
  expiryDate: string;
}

export function ReceiveDialog({
  orderId,
  lines,
  itemsById,
  warehouses,
}: {
  orderId: string;
  lines: PurchaseOrderItem[];
  itemsById: Map<string, Item>;
  warehouses: Warehouse[];
}) {
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [lineState, setLineState] = useState<Record<string, LineState>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const outstanding = lines.filter(
    (line) => Number(line.quantity_received) < Number(line.quantity_ordered),
  );

  const emptyLine: LineState = {
    quantityReceived: '',
    batchNo: '',
    expiryDate: '',
  };

  function updateLine(id: string, patch: Partial<LineState>) {
    setLineState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyLine), ...patch },
    }));
  }

  function submit() {
    if (!warehouseId) {
      setError('Choose a warehouse.');
      return;
    }
    const payload = outstanding
      .map((line) => {
        const state = lineState[line.id];
        if (!state?.quantityReceived) return null;
        return {
          purchase_order_item_id: line.id,
          quantity_received: state.quantityReceived,
          batch_no: state.batchNo || undefined,
          expiry_date: state.expiryDate || undefined,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    if (payload.length === 0) {
      setError('Enter a quantity for at least one line.');
      return;
    }

    startTransition(async () => {
      const result = await receivePurchaseOrder(orderId, warehouseId, payload);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success('Delivery recorded.');
        setOpen(false);
        setLineState({});
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Receive delivery</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive delivery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label>Receiving warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {outstanding.map((line) => {
            const item = itemsById.get(line.item_id);
            const remaining = (
              Number(line.quantity_ordered) - Number(line.quantity_received)
            ).toFixed(3);
            const state = lineState[line.id];
            return (
              <div key={line.id} className="space-y-2 rounded-md border p-3">
                <p className="font-medium">{item?.name ?? line.item_id}</p>
                <p className="text-sm text-muted-foreground">
                  {remaining} remaining of {line.quantity_ordered} ordered
                </p>
                <div className="flex flex-col gap-1.5">
                  <Label>Quantity received now</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max={remaining}
                    value={state?.quantityReceived ?? ''}
                    onChange={(event) =>
                      updateLine(line.id, {
                        quantityReceived: event.target.value,
                      })
                    }
                  />
                </div>
                {item?.track_expiry && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label>Batch number</Label>
                      <Input
                        value={state?.batchNo ?? ''}
                        onChange={(event) =>
                          updateLine(line.id, { batchNo: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Expiry date</Label>
                      <Input
                        type="date"
                        value={state?.expiryDate ?? ''}
                        onChange={(event) =>
                          updateLine(line.id, {
                            expiryDate: event.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={submit} disabled={pending} className="w-full">
            {pending ? 'Recording…' : 'Record delivery'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
