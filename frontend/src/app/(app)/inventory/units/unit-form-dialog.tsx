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
import { createUnit, updateUnit } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Unit } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function UnitFormDialog({ unit }: { unit?: Unit }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!unit;
  const action = isEdit ? updateUnit.bind(null, unit.id) : createUnit;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Unit'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit unit' : 'New unit'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={unit?.name}
                placeholder="e.g. Kilogram"
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
            <Field data-invalid={!!state.fieldErrors?.abbreviation}>
              <FieldLabel htmlFor="abbreviation">Abbreviation</FieldLabel>
              <Input
                id="abbreviation"
                name="abbreviation"
                defaultValue={unit?.abbreviation}
                placeholder="e.g. KG"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.abbreviation
                    ? [{ message: state.fieldErrors.abbreviation }]
                    : []
                }
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
