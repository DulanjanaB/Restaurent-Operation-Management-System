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
import { recordStockCount } from '@/lib/server/bar/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StockCountForm({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [state, formAction, pending] = useActionState(
    recordStockCount,
    initialState,
  );
  useActionToast(pending, state, 'Count recorded.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
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
          <FieldLabel htmlFor="counted_quantity">Counted quantity</FieldLabel>
          <Input
            id="counted_quantity"
            name="counted_quantity"
            type="number"
            step="0.001"
            min="0"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="counted_at">Date</FieldLabel>
          <Input
            id="counted_at"
            name="counted_at"
            type="date"
            defaultValue={today()}
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Recording…' : 'Record count'}
        </Button>
      </FieldGroup>
    </form>
  );
}
