'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { createBatch } from '@/lib/server/food-preservation/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  PreservedItem,
  StorageLocation,
} from '@/lib/server/food-preservation/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';
import { Checkbox } from '@/components/ui/checkbox';

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BatchCreateDialog({
  preservedItems,
  storageLocations,
  employees,
}: {
  preservedItems: PreservedItem[];
  storageLocations: StorageLocation[];
  employees: { id: string; name: string; employee_code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [preparerIds, setPreparerIds] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState(
    createBatch,
    initialState,
  );
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Batch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New batch</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.preserved_item_id}>
              <FieldLabel htmlFor="preserved_item_id">
                Preserved item
              </FieldLabel>
              <Select name="preserved_item_id" required>
                <SelectTrigger id="preserved_item_id">
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {preservedItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.storage_location_id}>
              <FieldLabel htmlFor="storage_location_id">
                Storage location
              </FieldLabel>
              <Select name="storage_location_id" required>
                <SelectTrigger id="storage_location_id">
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {storageLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.quantity}>
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.001"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.quantity
                    ? [{ message: state.fieldErrors.quantity }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.production_date}>
              <FieldLabel htmlFor="production_date">Production date</FieldLabel>
              <Input
                id="production_date"
                name="production_date"
                type="date"
                defaultValue={today()}
                required
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.expiry_date}>
              <FieldLabel htmlFor="expiry_date">Expiry date</FieldLabel>
              <Input id="expiry_date" name="expiry_date" type="date" required />
              <FieldError
                errors={
                  state.fieldErrors?.expiry_date
                    ? [{ message: state.fieldErrors.expiry_date }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.prepared_by_ids}>
              <FieldLabel>Prepared by</FieldLabel>
              <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={preparerIds.includes(employee.id)}
                      onCheckedChange={(checked) =>
                        setPreparerIds((current) =>
                          checked === true
                            ? [...current, employee.id]
                            : current.filter((id) => id !== employee.id),
                        )
                      }
                    />
                    {employee.name}
                    <span className="text-xs text-muted-foreground">
                      {employee.employee_code}
                    </span>
                  </label>
                ))}
              </div>
              {preparerIds.map((id) => (
                <input
                  key={id}
                  type="hidden"
                  name="prepared_by_id"
                  value={id}
                />
              ))}
              <FieldError
                errors={
                  state.fieldErrors?.prepared_by_ids
                    ? [{ message: 'Choose at least one person' }]
                    : []
                }
              />
              {employees.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No employees in this branch yet.
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" name="notes" rows={2} />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button
              type="submit"
              disabled={pending || preparerIds.length === 0}
            >
              {pending ? 'Creating…' : 'Create batch'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
