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
import { FileUploadField } from '@/components/shared/file-upload-field';
import { saveBusinessProfile } from '@/lib/server/settings/actions';
import type { ActionResult } from '@/lib/validation';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function BusinessProfileForm({
  values,
  readOnly,
}: {
  values: Record<string, unknown>;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveBusinessProfile,
    initialState,
  );
  useActionToast(pending, state, 'Business profile saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="business_name">Business name</FieldLabel>
          <Input
            id="business_name"
            name="business_name"
            defaultValue={(values.business_name as string) ?? ''}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel>Logo</FieldLabel>
          <FileUploadField
            name="logo_url"
            defaultUrl={values.logo_url as string}
            accept="image/*"
            label="logo"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            name="address"
            defaultValue={(values.address as string) ?? ''}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            name="phone"
            defaultValue={(values.phone as string) ?? ''}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={(values.email as string) ?? ''}
            disabled={readOnly}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <Input
            id="website"
            name="website"
            defaultValue={(values.website as string) ?? ''}
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
