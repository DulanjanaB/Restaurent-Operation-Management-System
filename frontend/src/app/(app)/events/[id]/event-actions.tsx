'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteEvent, transitionEvent } from '@/lib/server/events/actions';
import type { EventStatus } from '@/lib/server/events/types';

export function EventActions({
  eventId,
  status,
  canApprove,
  canUpdateStatus,
  canDelete,
}: {
  eventId: string;
  status: EventStatus;
  canApprove: boolean;
  canUpdateStatus: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const canCancel =
    canUpdateStatus &&
    (status === 'requested' ||
      status === 'confirmed' ||
      status === 'completed');

  return (
    <div className="flex items-center gap-2">
      {status === 'requested' && canApprove && (
        <ConfirmDialog
          trigger={<Button size="sm">Approve</Button>}
          title="Approve this event?"
          description="Moves the event from Requested to Confirmed."
          onConfirm={() => transitionEvent(eventId, 'approve')}
        />
      )}
      {status === 'confirmed' && canUpdateStatus && (
        <ConfirmDialog
          trigger={<Button size="sm">Mark completed</Button>}
          title="Mark this event as completed?"
          onConfirm={() => transitionEvent(eventId, 'complete')}
        />
      )}
      {status === 'completed' && canUpdateStatus && (
        <ConfirmDialog
          trigger={<Button size="sm">Close</Button>}
          title="Close this event?"
          description="Marks expenses and revenue as finalized."
          onConfirm={() => transitionEvent(eventId, 'close')}
        />
      )}
      {canCancel && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="outline">
              Cancel event
            </Button>
          }
          title="Cancel this event?"
          variant="destructive"
          confirmLabel="Cancel event"
          onConfirm={() => transitionEvent(eventId, 'cancel')}
        />
      )}
      {/* Delete is restricted to "requested" — nothing committed yet.
          Unlike cancel, this permanently erases the event along with any
          staff assignments/expenses/inventory requirements on it, and the
          backend has no status guard of its own for this one. */}
      {status === 'requested' && canDelete && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="outline">
              Delete
            </Button>
          }
          title="Permanently delete this event?"
          description="This can't be undone — use Cancel instead if you just want to mark it as not happening while keeping the record."
          variant="destructive"
          confirmLabel="Delete"
          onConfirm={async () => {
            const result = await deleteEvent(eventId);
            if (result.error) return result;
            toast.success('Event deleted.');
            router.push('/events');
          }}
        />
      )}
    </div>
  );
}
