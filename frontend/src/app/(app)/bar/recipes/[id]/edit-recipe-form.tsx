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
import { updateBarRecipe } from '@/lib/server/bar/actions';
import type { ActionResult } from '@/lib/validation';
import type { BarRecipe } from '@/lib/server/bar/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function EditRecipeForm({ recipe }: { recipe: BarRecipe }) {
  const action = updateBarRecipe.bind(null, recipe.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Recipe saved.');

  return (
    <form action={formAction} className="max-w-sm">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" defaultValue={recipe.name} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="selling_price">Selling price</FieldLabel>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={recipe.selling_price}
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </FieldGroup>
    </form>
  );
}
