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
import { logStorage } from '@/lib/server/food-preservation/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function LogStorageForm({
  storageLocationId,
}: {
  storageLocationId: string;
}) {
  const action = logStorage.bind(null, storageLocationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Log recorded.');

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <FieldGroup className="flex-row items-end gap-3">
        <Field data-invalid={!!state.fieldErrors?.temperature}>
          <FieldLabel htmlFor="temperature">Temperature (°C)</FieldLabel>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            step="0.1"
            className="w-36"
            required
          />
          <FieldError
            errors={
              state.fieldErrors?.temperature
                ? [{ message: state.fieldErrors.temperature }]
                : []
            }
          />
        </Field>
        <Field className="min-w-64 flex-1">
          <FieldLabel htmlFor="condition_notes">Condition notes</FieldLabel>
          <Input
            id="condition_notes"
            name="condition_notes"
            placeholder="e.g. door seal loose, ice buildup"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? 'Recording…' : 'Log check'}
      </Button>
      {state.error && <FieldError>{state.error}</FieldError>}
    </form>
  );
}
