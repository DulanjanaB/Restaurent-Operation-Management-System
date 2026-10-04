'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteTipPool } from '@/lib/server/tip-sharing/actions';

export function DeletePoolButton({
  poolId,
  date,
}: {
  poolId: string;
  date: string;
}) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="destructive">
          Delete pool
        </Button>
      }
      title={`Delete the ${date} pool?`}
      description="Only open pools can be deleted. This can't be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={async () => {
        const result = await deleteTipPool(poolId);
        if (result.error) return result;
        router.push('/tip-sharing/pools');
      }}
    />
  );
}
