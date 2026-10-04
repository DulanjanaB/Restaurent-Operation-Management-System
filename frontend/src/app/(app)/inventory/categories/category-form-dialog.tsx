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
import { createCategory, updateCategory } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { Category } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function CategoryFormDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!category;
  const action = isEdit
    ? updateCategory.bind(null, category.id)
    : createCategory;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? 'outline' : 'default'}
          size={isEdit ? 'sm' : 'default'}
        >
          {isEdit ? 'Edit' : 'New Category'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name}
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
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={category?.description ?? ''}
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
