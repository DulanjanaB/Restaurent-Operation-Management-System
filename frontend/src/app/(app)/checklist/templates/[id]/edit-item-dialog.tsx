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
import { updateChecklistItem } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import type { ChecklistItem } from '@/lib/server/checklist/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function EditItemDialog({
  templateId,
  item,
}: {
  templateId: string;
  item: ChecklistItem;
}) {
  const [open, setOpen] = useState(false);
  const action = async (
    _prev: ActionResult,
    formData: FormData,
  ): Promise<ActionResult> =>
    updateChecklistItem(templateId, item.id, {
      label: String(formData.get('label') ?? ''),
      requires_reason_on_no: formData.get('requires_reason_on_no') === 'on',
    });
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
          <DialogTitle>Edit checklist item</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.label}>
              <FieldLabel htmlFor="label">Question</FieldLabel>
              <Input
                id="label"
                name="label"
                defaultValue={item.label}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.label
                    ? [{ message: state.fieldErrors.label }]
                    : []
                }
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="requires_reason_on_no"
                name="requires_reason_on_no"
                defaultChecked={item.requires_reason_on_no}
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
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
