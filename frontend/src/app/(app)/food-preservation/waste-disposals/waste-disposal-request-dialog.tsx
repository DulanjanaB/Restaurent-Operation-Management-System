'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createWasteDisposal } from '@/lib/server/food-preservation/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  Batch,
  WasteDisposalReason,
} from '@/lib/server/food-preservation/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};
const REASONS: WasteDisposalReason[] = [
  'expired',
  'spoiled',
  'damaged',
  'quality_issue',
  'other',
];

export function WasteDisposalRequestDialog({ batches }: { batches: Batch[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createWasteDisposal,
    initialState,
  );
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Request disposal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a waste disposal</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.batch_id}>
              <FieldLabel htmlFor="batch_id">Batch</FieldLabel>
              <Select name="batch_id" required>
                <SelectTrigger id="batch_id">
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_code} ({batch.quantity} {batch.unit}{' '}
                      remaining)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.quantity}>
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.001"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.quantity
                    ? [{ message: state.fieldErrors.quantity }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.reason}>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Select name="reason" required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((reason) => (
                    <SelectItem
                      key={reason}
                      value={reason}
                      className="capitalize"
                    >
                      {reason.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Requesting…' : 'Request disposal'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
