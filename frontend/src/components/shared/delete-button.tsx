'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './confirm-dialog';
import type { ActionResult } from '@/lib/validation';

// Generic "delete this row" trigger for master-data tables — icon-only
// button + confirm dialog wrapping a bound Server Action. Reused across
// every simple CRUD list (Positions, Departments, Shift Templates,
// Document Types, and future modules' master data).
export function DeleteButton({
  onDelete,
  itemLabel = 'this item',
}: {
  onDelete: () => Promise<ActionResult | void>;
  itemLabel?: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="icon-sm" variant="ghost">
          <Trash2 className="size-4" />
        </Button>
      }
      title={`Delete ${itemLabel}?`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onDelete}
    />
  );
}
