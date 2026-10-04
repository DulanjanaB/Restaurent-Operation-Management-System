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
import { createVenue, updateVenue } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type { Venue } from '@/lib/server/events/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function VenueFormDialog({
  venue,
  branchId,
}: {
  venue?: Venue;
  branchId: string;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!venue;
  const action = isEdit
    ? updateVenue.bind(null, venue.id)
    : createVenue.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Venue'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit venue' : 'New venue'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={venue?.name}
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
            <Field data-invalid={!!state.fieldErrors?.capacity}>
              <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                defaultValue={venue?.capacity}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.capacity
                    ? [{ message: state.fieldErrors.capacity }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={venue?.description ?? ''}
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
