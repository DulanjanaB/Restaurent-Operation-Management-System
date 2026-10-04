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
  createShiftTemplate,
  updateShiftTemplate,
} from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';
import type { ShiftTemplate } from '@/lib/server/roster/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function ShiftTemplateFormDialog({
  template,
  branchId,
}: {
  template?: ShiftTemplate;
  branchId: string;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!template;
  const action = isEdit
    ? updateShiftTemplate.bind(null, template.id)
    : createShiftTemplate.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Shift Template'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit shift template' : 'New shift template'}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={template?.name}
                placeholder="e.g. Morning"
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
              <FieldLabel htmlFor="start_time">Start time</FieldLabel>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={template?.start_time?.slice(0, 5)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_time">End time</FieldLabel>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={template?.end_time?.slice(0, 5)}
                required
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
