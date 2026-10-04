'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { addChecklistItem } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function AddItemDialog({
  templateId,
  nextSequence,
}: {
  templateId: string;
  nextSequence: number;
}) {
  const [open, setOpen] = useState(false);
  const action = addChecklistItem.bind(null, templateId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add checklist item</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.label}>
              <FieldLabel htmlFor="label">Question</FieldLabel>
              <Input id="label" name="label" required />
              <FieldError
                errors={
                  state.fieldErrors?.label
                    ? [{ message: state.fieldErrors.label }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sequence">Position</FieldLabel>
              <Input
                id="sequence"
                name="sequence"
                type="number"
                min="1"
                step="1"
                defaultValue={nextSequence}
                required
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="requires_reason_on_no"
                name="requires_reason_on_no"
                defaultChecked
              />
              <FieldLabel
                htmlFor="requires_reason_on_no"
                className="font-normal"
              >
                Require a reason when answered &quot;No&quot;
              </FieldLabel>
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Adding…' : 'Add item'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
