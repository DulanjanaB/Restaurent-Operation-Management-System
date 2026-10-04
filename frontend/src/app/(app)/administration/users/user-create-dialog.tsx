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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createUser } from '@/lib/server/administration/actions';
import type { ActionResult } from '@/lib/validation';
import type { Branch } from '@/lib/server/administration/types';

const initialState: ActionResult = {};

export function UserCreateDialog({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createUser, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" name="name" required />
              <FieldError
                errors={
                  state.fieldErrors?.name
                    ? [{ message: state.fieldErrors.name }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.username}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" name="username" required />
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
              <Input id="email" name="email" type="email" required />
              <FieldError
                errors={
                  state.fieldErrors?.email
                    ? [{ message: state.fieldErrors.email }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input id="phone" name="phone" />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Temporary password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.password
                    ? [{ message: state.fieldErrors.password }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="primary_branch_id">
                Primary branch
              </FieldLabel>
              <Select name="primary_branch_id">
                <SelectTrigger id="primary_branch_id">
                  <SelectValue placeholder="No default branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create user'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
