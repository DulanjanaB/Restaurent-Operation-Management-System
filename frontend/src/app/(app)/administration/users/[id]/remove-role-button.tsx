'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { removeUserRole } from '@/lib/server/administration/actions';

export function RemoveRoleButton({
  userId,
  userRoleId,
}: {
  userId: string;
  userRoleId: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="icon-sm" variant="ghost">
          <X className="size-4" />
        </Button>
      }
      title="Remove this role assignment?"
      confirmLabel="Remove"
      variant="destructive"
      onConfirm={() => removeUserRole(userId, userRoleId)}
    />
  );
}
