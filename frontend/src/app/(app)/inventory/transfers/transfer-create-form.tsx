'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { X } from 'lucide-react';
import { createTransfer } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Warehouse } from '@/lib/server/inventory/types';

const initialState: ActionResult = {};

export function TransferCreateForm({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [state, formAction, pending] = useActionState(
    createTransfer,
    initialState,
  );
  const [lines, setLines] = useState([0]);

  return (
    <form action={formAction} className="max-w-lg">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="from_warehouse_id">From warehouse</FieldLabel>
          <Select name="from_warehouse_id" required>
            <SelectTrigger id="from_warehouse_id">
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
        </Field>
        <Field>
          <FieldLabel htmlFor="to_warehouse_id">To warehouse</FieldLabel>
          <Select name="to_warehouse_id" required>
            <SelectTrigger id="to_warehouse_id">
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
        </Field>

        <div className="space-y-2">
          <FieldLabel>Items</FieldLabel>
          {lines.map((lineKey) => (
            <div key={lineKey} className="flex items-end gap-2">
              <Select name="item_id">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="quantity"
                type="number"
                step="0.001"
                min="0"
                placeholder="Qty"
                className="w-28"
              />
              {lines.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setLines((prev) => prev.filter((k) => k !== lineKey))
                  }
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLines((prev) => [...prev, Date.now()])}
          >
            Add line
          </Button>
        </div>

        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create transfer'}
        </Button>
      </FieldGroup>
    </form>
  );
}
