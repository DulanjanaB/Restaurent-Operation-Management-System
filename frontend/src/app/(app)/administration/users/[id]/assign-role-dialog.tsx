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
import { assignUserRole } from '@/lib/server/administration/actions';
import type { Branch, Role } from '@/lib/server/administration/types';

export function AssignRoleDialog({
  userId,
  roles,
  branches,
}: {
  userId: string;
  roles: Role[];
  branches: Branch[];
}) {
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submit() {
    if (!roleId) {
      setError('Choose a role.');
      return;
    }
    startTransition(async () => {
      const result = await assignUserRole(
        userId,
        roleId,
        branchId === 'all' ? null : branchId,
      );
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success('Role assigned.');
        setOpen(false);
        setRoleId('');
        setBranchId('all');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Assign role</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a role</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Branch scope</FieldLabel>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Assigning…' : 'Assign'}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
