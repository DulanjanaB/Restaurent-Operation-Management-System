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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createTipPool } from '@/lib/server/tip-sharing/actions';
import type { ActionResult } from '@/lib/validation';

const initialState: ActionResult = {};

export function PoolCreateDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = useState(false);
  const action = createTipPool.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Tip Pool</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New tip pool</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input id="date" name="date" type="date" required />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.total_amount}>
              <FieldLabel htmlFor="total_amount">Total amount</FieldLabel>
              <Input
                id="total_amount"
                name="total_amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.total_amount
                    ? [{ message: state.fieldErrors.total_amount }]
                    : []
                }
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create pool'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
