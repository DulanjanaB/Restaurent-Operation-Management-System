'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteRole } from '@/lib/server/administration/actions';

export function DeleteRoleButton({ roleId }: { roleId: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="outline">
          Delete
        </Button>
      }
      title="Delete this role?"
      description="Users holding this role will lose the permissions it grants. This can't be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={() => deleteRole(roleId)}
    />
  );
}
