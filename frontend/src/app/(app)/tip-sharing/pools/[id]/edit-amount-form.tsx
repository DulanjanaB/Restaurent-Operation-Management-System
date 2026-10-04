'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateTipPoolAmount } from '@/lib/server/tip-sharing/actions';

export function EditAmountForm({
  poolId,
  totalAmount,
}: {
  poolId: string;
  totalAmount: string;
}) {
  const [value, setValue] = useState(totalAmount);
  const [pending, startTransition] = useTransition();

  function save() {
    if (value === totalAmount) return;
    startTransition(async () => {
      const result = await updateTipPoolAmount(poolId, value);
      if (result?.error) toast.error(result.error);
      else toast.success('Total amount updated.');
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        min="0"
        className="w-32"
        value={value}
        disabled={pending}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={save}
        disabled={pending || value === totalAmount}
      >
        Save
      </Button>
    </div>
  );
}
