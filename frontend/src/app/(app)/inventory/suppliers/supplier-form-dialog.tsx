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
import { createSupplier, updateSupplier } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Supplier } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function SupplierFormDialog({ supplier }: { supplier?: Supplier }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!supplier;
  const action = isEdit
    ? updateSupplier.bind(null, supplier.id)
    : createSupplier;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Supplier'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit supplier' : 'New supplier'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={supplier?.name}
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
              <FieldLabel htmlFor="contact_person">Contact person</FieldLabel>
              <Input
                id="contact_person"
                name="contact_person"
                defaultValue={supplier?.contact_person ?? ''}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                defaultValue={supplier?.phone ?? ''}
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={supplier?.email ?? ''}
              />
              <FieldError
                errors={
                  state.fieldErrors?.email
                    ? [{ message: state.fieldErrors.email }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                defaultValue={supplier?.address ?? ''}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={supplier?.notes ?? ''}
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
