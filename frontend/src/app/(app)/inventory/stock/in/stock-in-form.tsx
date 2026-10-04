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
import { stockIn } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function StockInForm({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [state, formAction, pending] = useActionState(stockIn, initialState);
  useActionToast(pending, state, 'Stock added.');
  const [itemId, setItemId] = useState('');
  const selectedItem = items.find((item) => item.id === itemId);
  const requiresBatch = selectedItem?.track_expiry ?? false;

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="item_id">Item</FieldLabel>
          <Select
            name="item_id"
            value={itemId}
            onValueChange={setItemId}
            required
          >
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
          <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.001"
            min="0"
            required
          />
        </Field>
        {requiresBatch && (
          <>
            <Field data-invalid={!!state.fieldErrors?.batch_no}>
              <FieldLabel htmlFor="batch_no">
                Batch number (required — tracks expiry)
              </FieldLabel>
              <Input id="batch_no" name="batch_no" required />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.expiry_date}>
              <FieldLabel htmlFor="expiry_date">
                Expiry date (required)
              </FieldLabel>
              <Input id="expiry_date" name="expiry_date" type="date" required />
            </Field>
          </>
        )}
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Recording…' : 'Record stock in'}
        </Button>
      </FieldGroup>
    </form>
  );
}
