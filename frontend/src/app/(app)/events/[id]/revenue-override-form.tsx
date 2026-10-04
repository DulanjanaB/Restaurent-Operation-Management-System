'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { setRevenueOverride } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function RevenueOverrideForm({
  eventId,
  currentOverride,
}: {
  eventId: string;
  currentOverride: string | null;
}) {
  const action = setRevenueOverride.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Revenue override saved.');

  return (
    <form action={formAction} className="flex items-end gap-2">
      <FieldGroup className="flex-1">
        <Field>
          <FieldLabel htmlFor="revenue_override">Revenue override</FieldLabel>
          <Input
            id="revenue_override"
            name="revenue_override"
            type="number"
            step="0.01"
            min="0"
            placeholder="Use package pricing"
            defaultValue={currentOverride ?? ''}
          />
          {state.error && <FieldError>{state.error}</FieldError>}
        </Field>
      </FieldGroup>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
