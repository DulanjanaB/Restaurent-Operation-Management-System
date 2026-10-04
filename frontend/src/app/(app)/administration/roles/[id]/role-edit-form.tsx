'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { updateRole } from '@/lib/server/administration/actions';
import type { ActionResult } from '@/lib/validation';
import type { Role } from '@/lib/server/administration/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function RoleEditForm({ role }: { role: Role }) {
  const action = updateRole.bind(null, role.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Details saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" defaultValue={role.name} required />
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
            defaultValue={role.description ?? ''}
          />
        </Field>
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Saving…' : 'Save details'}
        </Button>
      </FieldGroup>
    </form>
  );
}
