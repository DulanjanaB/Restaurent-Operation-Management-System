'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { updateChecklistTemplate } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import type { ChecklistTemplate } from '@/lib/server/checklist/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function EditTemplateForm({
  template,
}: {
  template: ChecklistTemplate;
}) {
  const action = updateChecklistTemplate.bind(null, template.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Template saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" defaultValue={template.name} required />
          <FieldError
            errors={
              state.fieldErrors?.name
                ? [{ message: state.fieldErrors.name }]
                : []
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="area">Area</FieldLabel>
          <Input id="area" name="area" defaultValue={template.area ?? ''} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={template.description ?? ''}
          />
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="is_active"
            name="is_active"
            defaultChecked={template.is_active}
          />
          <FieldLabel htmlFor="is_active" className="font-normal">
            Active (unchecking archives this template — past records and
            assignments are kept)
          </FieldLabel>
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </FieldGroup>
    </form>
  );
}
