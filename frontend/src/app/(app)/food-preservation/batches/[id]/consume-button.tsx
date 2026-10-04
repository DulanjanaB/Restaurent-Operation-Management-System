'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { consumeBatch } from '@/lib/server/food-preservation/actions';

export function ConsumeButton({ batchId }: { batchId: string }) {
  return (
    <ConfirmDialog
      trigger={<Button size="sm">Mark consumed</Button>}
      title="Mark this batch as consumed?"
      description="This is a terminal state — the batch can't be reactivated afterward."
      onConfirm={() => consumeBatch(batchId)}
    />
  );
}
