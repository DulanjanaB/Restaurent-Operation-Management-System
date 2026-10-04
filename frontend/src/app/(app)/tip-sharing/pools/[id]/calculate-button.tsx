'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { calculateTipPool } from '@/lib/server/tip-sharing/actions';

export function CalculateButton({ poolId }: { poolId: string }) {
  return (
    <ConfirmDialog
      trigger={<Button>Calculate</Button>}
      title="Calculate this pool?"
      description="This locks in each participant's amount based on their percentage share. It can't be undone or edited afterward. Any leftover cents from rounding carry forward into the next day's pool for this branch."
      confirmLabel="Calculate"
      onConfirm={() => calculateTipPool(poolId)}
    />
  );
}
