'use client';

import { useActionState } from 'react';
import { Mail, Phone, UserRound, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { updateMyProfile } from '@/lib/server/profile/actions';
import type { ActionResult } from '@/lib/validation';
import type { AppUser } from '@/lib/server/administration/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';
import { AvatarUploader } from './avatar-uploader';

const initialState: ActionResult = {};

export function ProfileForm({ user }: { user: AppUser }) {
  const [state, formAction, pending] = useActionState(
    updateMyProfile,
    initialState,
  );
  useActionToast(pending, state, 'Profile saved.');

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <div className="rounded-2xl bg-gradient-to-b from-indigo-50 to-fuchsia-50 p-6 ring-1 ring-foreground/5 dark:from-indigo-500/10 dark:to-fuchsia-500/10">
        <AvatarUploader name={user.name} defaultUrl={user.avatar_url} />
      </div>

      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            data-invalid={!!state.fieldErrors?.name}
            className="sm:col-span-2"
          >
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                required
                className="pl-9"
              />
            </div>
            <FieldError
              errors={
                state.fieldErrors?.name
                  ? [{ message: state.fieldErrors.name }]
                  : []
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                value={user.username}
                disabled
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Contact an administrator to change your username.
            </p>
          </Field>

          <Field data-invalid={!!state.fieldErrors?.phone}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone ?? ''}
                placeholder="+43 …"
                className="pl-9"
              />
            </div>
            <FieldError
              errors={
                state.fieldErrors?.phone
                  ? [{ message: state.fieldErrors.phone }]
                  : []
              }
            />
          </Field>

          <Field
            data-invalid={!!state.fieldErrors?.email}
            className="sm:col-span-2"
          >
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sky-500" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="pl-9"
              />
            </div>
            <FieldError
              errors={
                state.fieldErrors?.email
                  ? [{ message: state.fieldErrors.email }]
                  : []
              }
            />
          </Field>
        </div>

        <FieldGroup>
          {state.error && <FieldError>{state.error}</FieldError>}
          <div>
            <Button
              type="submit"
              disabled={pending}
              className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md hover:from-indigo-500 hover:to-fuchsia-500"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </FieldGroup>
      </div>
    </form>
  );
}
