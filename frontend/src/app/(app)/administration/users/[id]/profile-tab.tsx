'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import {
  deleteUser,
  resetUserPassword,
  setUserActive,
  updateUser,
} from '@/lib/server/administration/actions';
import type { ActionResult } from '@/lib/validation';
import type { AppUser, Branch } from '@/lib/server/administration/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function ProfileTab({
  user,
  branches,
  canUpdate,
  canActivate,
  canResetPassword,
  canDelete,
}: {
  user: AppUser;
  branches: Branch[];
  canUpdate: boolean;
  canActivate: boolean;
  canResetPassword: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const action = updateUser.bind(null, user.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Profile saved.');

  async function handleResetPassword() {
    const result = await resetUserPassword(user.id);
    if (result.error) return { error: result.error };
    if (result.generatedPassword) {
      toast.success('Temporary password generated', {
        description: result.generatedPassword,
        duration: 30000,
      });
    } else {
      toast.success('Password reset.');
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <form action={formAction}>
        <FieldGroup>
          <Field data-invalid={!!state.fieldErrors?.name}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              disabled={!canUpdate}
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
          <Field data-invalid={!!state.fieldErrors?.username}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              defaultValue={user.username}
              disabled={!canUpdate}
              required
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
              defaultValue={user.email}
              disabled={!canUpdate}
              required
            />
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
            <Input
              id="phone"
              name="phone"
              defaultValue={user.phone ?? ''}
              disabled={!canUpdate}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="primary_branch_id">Primary branch</FieldLabel>
            <Select
              name="primary_branch_id"
              defaultValue={user.primary_branch_id ?? undefined}
              disabled={!canUpdate}
            >
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
          {canUpdate && (
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? 'Saving…' : 'Save profile'}
            </Button>
          )}
        </FieldGroup>
      </form>

      {(canActivate || canResetPassword || canDelete) && (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {canActivate && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              }
              title={
                user.status === 'active'
                  ? 'Deactivate this user?'
                  : 'Activate this user?'
              }
              description={
                user.status === 'active'
                  ? 'They will no longer be able to log in.'
                  : 'They will be able to log in again.'
              }
              confirmLabel={
                user.status === 'active' ? 'Deactivate' : 'Activate'
              }
              variant={user.status === 'active' ? 'destructive' : 'default'}
              onConfirm={() => setUserActive(user.id, user.status !== 'active')}
            />
          )}
          {canResetPassword && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  Reset password
                </Button>
              }
              title="Reset this user's password?"
              description="A new temporary password will be generated and shown once."
              confirmLabel="Reset"
              onConfirm={handleResetPassword}
            />
          )}
          {canDelete && (
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm">
                  Delete user
                </Button>
              }
              title={`Permanently delete ${user.name}?`}
              description="This can't be undone. If they have a linked employee record or any activity history, the server will reject this — use Deactivate instead for those."
              variant="destructive"
              confirmLabel="Delete"
              onConfirm={async () => {
                const result = await deleteUser(user.id);
                if (result.error) return result;
                toast.success('User deleted.');
                router.push('/administration/users');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
