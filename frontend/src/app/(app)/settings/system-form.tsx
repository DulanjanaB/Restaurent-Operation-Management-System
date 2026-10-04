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
import { saveSystem } from '@/lib/server/settings/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function SystemForm({
  values,
  readOnly,
}: {
  values: Record<string, unknown>;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveSystem, initialState);
  useActionToast(pending, state, 'System settings saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          These affect how dates, amounts, and numbers are displayed across the
          whole app.
        </p>
        <Field>
          <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
          <Input
            id="timezone"
            name="timezone"
            placeholder="e.g. Asia/Colombo"
            defaultValue={(values.timezone as string) ?? 'UTC'}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <Input
            id="currency"
            name="currency"
            placeholder="e.g. USD, LKR"
            defaultValue={(values.currency as string) ?? 'USD'}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="date_format">Date format</FieldLabel>
          <Input
            id="date_format"
            name="date_format"
            placeholder="e.g. YYYY-MM-DD"
            defaultValue={(values.date_format as string) ?? 'YYYY-MM-DD'}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="number_format">Number format locale</FieldLabel>
          <Input
            id="number_format"
            name="number_format"
            placeholder="e.g. en-US"
            defaultValue={(values.number_format as string) ?? 'en-US'}
            disabled={readOnly}
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        {!readOnly && (
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? 'Saving…' : 'Save'}
          </Button>
        )}
      </FieldGroup>
    </form>
  );
}
