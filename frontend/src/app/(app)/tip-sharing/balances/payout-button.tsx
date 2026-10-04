'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { payoutEmployee } from '@/lib/server/tip-sharing/actions';

export function PayoutButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="outline">
          Pay out
        </Button>
      }
      title={`Pay out ${employeeName}'s tip balance?`}
      description="This clears their entire unpaid balance and records a payout."
      confirmLabel="Pay out"
      onConfirm={() => payoutEmployee(employeeId)}
    />
  );
}
