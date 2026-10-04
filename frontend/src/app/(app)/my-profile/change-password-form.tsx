'use client';

import { useActionState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { changeMyPassword } from '@/lib/server/profile/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionSuccess } from '@/lib/hooks/use-action-success';
import { toast } from 'sonner';

const initialState: ActionResult = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    changeMyPassword,
    initialState,
  );

  useActionSuccess(pending, state, () => {
    toast.success('Password changed.');
    formRef.current?.reset();
  });

  return (
    <form ref={formRef} action={formAction} className="max-w-sm">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.currentPassword}>
          <FieldLabel htmlFor="current_password">Current password</FieldLabel>
          <Input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.newPassword}>
          <FieldLabel htmlFor="new_password">New password</FieldLabel>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FieldError
            errors={
              state.fieldErrors?.newPassword
                ? [{ message: state.fieldErrors.newPassword }]
                : []
            }
          />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.confirm_password}>
          <FieldLabel htmlFor="confirm_password">
            Confirm new password
          </FieldLabel>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FieldError
            errors={
              state.fieldErrors?.confirm_password
                ? [{ message: state.fieldErrors.confirm_password }]
                : []
            }
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Changing…' : 'Change password'}
        </Button>
      </FieldGroup>
    </form>
  );
}
