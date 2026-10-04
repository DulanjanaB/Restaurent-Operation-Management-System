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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import {
  createPreservedItem,
  updatePreservedItem,
} from '@/lib/server/food-preservation/actions';
import type { ActionResult } from '@/lib/validation';
import type { PreservedItem } from '@/lib/server/food-preservation/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function PreservedItemFormDialog({ item }: { item?: PreservedItem }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!item;
  const action = isEdit
    ? updatePreservedItem.bind(null, item.id)
    : createPreservedItem;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Preserved Item'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit preserved item' : 'New preserved item'}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            {!isEdit && (
              <Field data-invalid={!!state.fieldErrors?.code}>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input id="code" name="code" placeholder="e.g. CHK" required />
                <FieldError
                  errors={
                    state.fieldErrors?.code
                      ? [{ message: state.fieldErrors.code }]
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
            <Field data-invalid={!!state.fieldErrors?.default_unit}>
              <FieldLabel htmlFor="default_unit">Default unit</FieldLabel>
              <Input
                id="default_unit"
                name="default_unit"
                placeholder="e.g. kg"
                defaultValue={item?.default_unit}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.default_unit
                    ? [{ message: state.fieldErrors.default_unit }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Input
                id="category"
                name="category"
                defaultValue={item?.category ?? ''}
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
