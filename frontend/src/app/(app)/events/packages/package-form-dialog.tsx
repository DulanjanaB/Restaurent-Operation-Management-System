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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createPackage, updatePackage } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type { EventPackage } from '@/lib/server/events/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function PackageFormDialog({
  eventPackage,
  branchId,
}: {
  eventPackage?: EventPackage;
  branchId: string;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!eventPackage;
  const action = isEdit
    ? updatePackage.bind(null, eventPackage.id)
    : createPackage.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Package'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit package' : 'New package'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={eventPackage?.name}
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
              <FieldLabel htmlFor="price_per_guest">Price per guest</FieldLabel>
              <Input
                id="price_per_guest"
                name="price_per_guest"
                type="number"
                step="0.01"
                min="0"
                defaultValue={eventPackage?.price_per_guest ?? ''}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="flat_price">Flat price</FieldLabel>
              <Input
                id="flat_price"
                name="flat_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={eventPackage?.flat_price ?? ''}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              If both are set, price per guest is used (× guest count). Leave
              both blank if pricing is always set manually per event.
            </p>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={eventPackage?.description ?? ''}
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
