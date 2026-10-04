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
import { createPurchaseOrder } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Item, Supplier } from '@/lib/server/inventory/types';

const initialState: ActionResult = {};

export function PoCreateForm({
  branchId,
  items,
  suppliers,
}: {
  branchId: string;
  items: Item[];
  suppliers: Supplier[];
}) {
  const action = createPurchaseOrder.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [lines, setLines] = useState([0]);

  return (
    <form action={formAction} className="max-w-lg">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="supplier_id">Supplier</FieldLabel>
          <Select name="supplier_id" required>
            <SelectTrigger id="supplier_id">
              <SelectValue placeholder="Choose a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="order_date">Order date</FieldLabel>
          <Input id="order_date" name="order_date" type="date" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="expected_date">Expected date</FieldLabel>
          <Input id="expected_date" name="expected_date" type="date" />
        </Field>

        <div className="space-y-2">
          <FieldLabel>Items</FieldLabel>
          {lines.map((lineKey) => (
            <div key={lineKey} className="flex items-end gap-2">
              <Select name="item_id">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Item" />
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
                name="quantity_ordered"
                type="number"
                step="0.001"
                min="0"
                placeholder="Qty"
                className="w-24"
              />
              <Input
                name="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Unit price"
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
          {pending ? 'Creating…' : 'Create purchase order'}
        </Button>
      </FieldGroup>
    </form>
  );
}
