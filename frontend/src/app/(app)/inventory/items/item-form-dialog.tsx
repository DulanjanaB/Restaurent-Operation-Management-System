'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createItem, updateItem } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Category, Item, Unit } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function ItemFormDialog({
  item,
  categories,
  units,
}: {
  item?: Item;
  categories: Category[];
  units: Unit[];
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!item;
  const action = isEdit ? updateItem.bind(null, item.id) : createItem;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Item'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit item' : 'New item'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            {!isEdit && (
              <Field data-invalid={!!state.fieldErrors?.sku}>
                <FieldLabel htmlFor="sku">SKU</FieldLabel>
                <Input id="sku" name="sku" required />
                <FieldError
                  errors={
                    state.fieldErrors?.sku
                      ? [{ message: state.fieldErrors.sku }]
                      : []
                  }
                />
              </Field>
            )}
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" defaultValue={item?.name} required />
              <FieldError
                errors={
                  state.fieldErrors?.name
                    ? [{ message: state.fieldErrors.name }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category_id">Category</FieldLabel>
              <Select
                name="category_id"
                defaultValue={item?.category_id}
                required
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="unit_id">Unit</FieldLabel>
              <Select name="unit_id" defaultValue={item?.unit_id} required>
                <SelectTrigger id="unit_id">
                  <SelectValue placeholder="Choose a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <Switch
                id="track_expiry"
                name="track_expiry"
                defaultChecked={item?.track_expiry ?? false}
              />
              <FieldLabel htmlFor="track_expiry">
                Track expiry (requires a batch on stock-in)
              </FieldLabel>
            </Field>
            <Field>
              <FieldLabel htmlFor="base_unit_quantity">
                Base unit quantity (optional — e.g. 750 for a 750ml bottle)
              </FieldLabel>
              <Input
                id="base_unit_quantity"
                name="base_unit_quantity"
                type="number"
                step="0.001"
                min="0"
                defaultValue={item?.base_unit_quantity ?? ''}
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
