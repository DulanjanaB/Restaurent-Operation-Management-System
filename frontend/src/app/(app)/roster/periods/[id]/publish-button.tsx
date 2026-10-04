'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { publishRosterPeriod } from '@/lib/server/roster/actions';

export function PublishButton({ periodId }: { periodId: string }) {
  return (
    <ConfirmDialog
      trigger={<Button>Publish</Button>}
      title="Publish this roster period?"
      description="Publishing makes this roster visible to staff and locks the period's own dates from further editing. Shifts can still be added afterward."
      confirmLabel="Publish"
      onConfirm={() => publishRosterPeriod(periodId)}
    />
  );
}
