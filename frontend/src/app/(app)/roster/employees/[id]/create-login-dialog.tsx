'use client';

import { useActionState, useState } from 'react';
import { toast } from 'sonner';
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
import { createLoginForEmployee } from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionSuccess } from '@/lib/hooks/use-action-success';

const initialState: ActionResult & { generatedPassword?: string } = {};

export function CreateLoginDialog({
  employeeId,
  employeeName,
  employeeCode,
  employeeEmail,
}: {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const action = async (
    _prev: ActionResult & { generatedPassword?: string },
    formData: FormData,
  ) =>
    createLoginForEmployee(
      employeeId,
      employeeName,
      String(formData.get('username') ?? ''),
      String(formData.get('email') ?? ''),
    );
  const [state, formAction, pending] = useActionState(action, initialState);

  useActionSuccess(pending, state, (result) => {
    if (result.generatedPassword) {
      toast.success('Login created', {
        description: `Temporary password: ${result.generatedPassword}`,
        duration: 30000,
      });
    }
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Create login
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a login for {employeeName}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.username}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                required
                defaultValue={employeeCode.toLowerCase()}
              />
              <FieldError
                errors={
                  state.fieldErrors?.username
                    ? [{ message: state.fieldErrors.username }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={employeeEmail ?? ''}
              />
              <FieldError
                errors={
                  state.fieldErrors?.email
                    ? [{ message: state.fieldErrors.email }]
                    : []
                }
              />
              <p className="text-xs text-muted-foreground">
                A temporary password will be generated and shown once after
                creation.
              </p>
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create login'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
