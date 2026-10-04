'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { DeleteButton } from '@/components/shared/delete-button';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import {
  removeParticipant,
  updateParticipantPercentage,
} from '@/lib/server/tip-sharing/actions';
import type { TipAllocation } from '@/lib/server/tip-sharing/types';
import { Money } from '@/components/shared/money';

export function ParticipantsList({
  poolId,
  allocations,
  locked,
  canManage,
}: {
  poolId: string;
  allocations: TipAllocation[];
  locked: boolean;
  canManage: boolean;
}) {
  if (allocations.length === 0) {
    return <EmptyState title="No participants yet" />;
  }

  return (
    <ul className="divide-y rounded-md border">
      {allocations.map((allocation) => (
        <ParticipantRow
          key={allocation.id}
          poolId={poolId}
          allocation={allocation}
          locked={locked}
          canManage={canManage}
        />
      ))}
    </ul>
  );
}

function ParticipantRow({
  poolId,
  allocation,
  locked,
  canManage,
}: {
  poolId: string;
  allocation: TipAllocation;
  locked: boolean;
  canManage: boolean;
}) {
  const [percentage, setPercentage] = useState(allocation.percentage);
  const [pending, startTransition] = useTransition();

  function commit() {
    if (percentage === allocation.percentage) return;
    startTransition(async () => {
      const result = await updateParticipantPercentage(
        poolId,
        allocation.id,
        percentage,
      );
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="font-medium">{allocation.employee?.name}</p>
        <p className="text-sm text-muted-foreground">
          {allocation.employee?.employee_code}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {locked ? (
          <span className="font-medium">
            <Money value={allocation.amount} />
          </span>
        ) : (
          canManage && (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step="0.01"
                min="0"
                className="w-20"
                value={percentage}
                disabled={pending}
                onChange={(event) => setPercentage(event.target.value)}
                onBlur={commit}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          )
        )}
        {!locked && canManage && (
          <DeleteButton
            itemLabel={`${allocation.employee?.name} from this pool`}
            onDelete={() => removeParticipant(poolId, allocation.id)}
          />
        )}
      </div>
    </li>
  );
}
