'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { removeUserPermissionOverride } from '@/lib/server/administration/actions';

export function RemovePermissionOverrideButton({
  userId,
  permissionId,
}: {
  userId: string;
  permissionId: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="icon-sm" variant="ghost">
          <X className="size-4" />
        </Button>
      }
      title="Remove this permission override?"
      confirmLabel="Remove"
      variant="destructive"
      onConfirm={() => removeUserPermissionOverride(userId, permissionId)}
    />
  );
}
