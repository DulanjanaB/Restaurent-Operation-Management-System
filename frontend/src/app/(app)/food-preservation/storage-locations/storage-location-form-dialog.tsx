'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  createStorageLocation,
  updateStorageLocation,
} from '@/lib/server/food-preservation/actions';
import type { ActionResult } from '@/lib/validation';
import type { StorageLocation } from '@/lib/server/food-preservation/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};
const TYPES = ['freezer', 'chiller', 'dry_store'] as const;

export function StorageLocationFormDialog({
  location,
  branchId,
}: {
  location?: StorageLocation;
  branchId: string;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!location;
  const action = isEdit
    ? updateStorageLocation.bind(null, location.id)
    : createStorageLocation.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Storage Location'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit storage location' : 'New storage location'}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={location?.name}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.name
                    ? [{ message: state.fieldErrors.name }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <Select
                name="type"
                defaultValue={location?.type ?? 'freezer'}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="target_temp_min">
                Target temp min (°C)
              </FieldLabel>
              <Input
                id="target_temp_min"
                name="target_temp_min"
                type="number"
                step="0.1"
                defaultValue={location?.target_temp_min ?? ''}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="target_temp_max">
                Target temp max (°C)
              </FieldLabel>
              <Input
                id="target_temp_max"
                name="target_temp_max"
                type="number"
                step="0.1"
                defaultValue={location?.target_temp_max ?? ''}
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
