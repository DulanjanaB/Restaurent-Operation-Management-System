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
import { createStockIssue } from '@/lib/server/bar/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function StockIssueForm({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [state, formAction, pending] = useActionState(
    createStockIssue,
    initialState,
  );
  useActionToast(pending, state, 'Stock issue requested.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          This creates a pending stock transfer request. An administrator with
          inventory permissions still needs to approve and complete it from
          Inventory → Transfers.
        </p>
        <Field>
          <FieldLabel htmlFor="from_warehouse_id">From warehouse</FieldLabel>
          <Select name="from_warehouse_id" required>
            <SelectTrigger id="from_warehouse_id">
              <SelectValue placeholder="e.g. Main Store" />
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
              <SelectValue placeholder="e.g. Bar Store" />
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
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Requesting…' : 'Request stock issue'}
        </Button>
      </FieldGroup>
    </form>
  );
}
