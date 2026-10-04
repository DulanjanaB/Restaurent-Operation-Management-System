'use client';

import { useActionState } from 'react';
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
import { stockAdjustment } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function AdjustmentForm({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [state, formAction, pending] = useActionState(
    stockAdjustment,
    initialState,
  );
  useActionToast(pending, state, 'Stock adjusted.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          Directly correct a count. Enter the new absolute quantity, not a
          change amount.
        </p>
        <Field>
          <FieldLabel htmlFor="item_id">Item</FieldLabel>
          <Select name="item_id" required>
            <SelectTrigger id="item_id">
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
        </Field>
        <Field>
          <FieldLabel htmlFor="warehouse_id">Warehouse</FieldLabel>
          <Select name="warehouse_id" required>
            <SelectTrigger id="warehouse_id">
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
          <FieldLabel htmlFor="new_quantity">New quantity</FieldLabel>
          <Input
            id="new_quantity"
            name="new_quantity"
            type="number"
            step="0.001"
            min="0"
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Adjusting…' : 'Adjust'}
        </Button>
      </FieldGroup>
    </form>
  );
}
