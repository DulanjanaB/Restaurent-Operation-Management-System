'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { setUserPermissionOverride } from '@/lib/server/administration/actions';
import type {
  Permission,
  PermissionEffect,
} from '@/lib/server/administration/types';

export function AddPermissionOverrideDialog({
  userId,
  permissions,
}: {
  userId: string;
  permissions: Permission[];
}) {
  const [open, setOpen] = useState(false);
  const [permissionId, setPermissionId] = useState('');
  const [effect, setEffect] = useState<PermissionEffect>('grant');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submit() {
    if (!permissionId) {
      setError('Choose a permission.');
      return;
    }
    startTransition(async () => {
      const result = await setUserPermissionOverride(
        userId,
        permissionId,
        effect,
      );
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success('Permission override saved.');
        setOpen(false);
        setPermissionId('');
        setEffect('grant');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add override</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a permission override</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Permission</FieldLabel>
            <Select value={permissionId} onValueChange={setPermissionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a permission" />
              </SelectTrigger>
              <SelectContent>
                {permissions.map((permission) => (
                  <SelectItem key={permission.id} value={permission.id}>
                    {permission.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Effect</FieldLabel>
            <Select
              value={effect}
              onValueChange={(value) => setEffect(value as PermissionEffect)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grant">
                  Grant — add on top of their roles
                </SelectItem>
                <SelectItem value="revoke">
                  Revoke — remove even if a role grants it
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Save override'}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
