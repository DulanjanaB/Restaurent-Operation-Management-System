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
import { createRosterPeriod } from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';

const initialState: ActionResult = {};

export function PeriodCreateDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = useState(false);
  const action = createRosterPeriod.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Period</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New roster period</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="period_type">Type</FieldLabel>
              <Select name="period_type" defaultValue="weekly" required>
                <SelectTrigger id="period_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="start_date">Start date</FieldLabel>
              <Input id="start_date" name="start_date" type="date" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_date">End date</FieldLabel>
              <Input id="end_date" name="end_date" type="date" required />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
