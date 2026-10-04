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
import { updateRosterPeriod } from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';
import type { RosterPeriod } from '@/lib/server/roster/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function EditPeriodDialog({ period }: { period: RosterPeriod }) {
  const [open, setOpen] = useState(false);
  const action = updateRosterPeriod.bind(null, period.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit roster period</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.start_date}>
              <FieldLabel htmlFor="start_date">Start date</FieldLabel>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={period.start_date}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.start_date
                    ? [{ message: state.fieldErrors.start_date }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.end_date}>
              <FieldLabel htmlFor="end_date">End date</FieldLabel>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={period.end_date}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.end_date
                    ? [{ message: state.fieldErrors.end_date }]
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
