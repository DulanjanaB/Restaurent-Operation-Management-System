'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
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
import { saveAppearance } from '@/lib/server/settings/actions';
import type { ActionResult } from '@/lib/validation';
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  isThemeKey,
  isThemeMode,
} from '@/lib/theme/themes';
import { DEFAULT_FONT, isFontKey } from '@/lib/theme/fonts';
import { useActionToast } from '@/lib/hooks/use-action-toast';
import { ThemeSwatchPicker } from './theme-swatch-picker';
import { FontPicker } from './font-picker';

const initialState: ActionResult = {};

export function AppearanceForm({
  values,
  logoUrl,
  readOnly,
}: {
  values: Record<string, unknown>;
  logoUrl?: string;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveAppearance,
    initialState,
  );
  useActionToast(pending, state, 'Appearance saved.');

  const currentTheme = isThemeKey(values.theme) ? values.theme : DEFAULT_THEME;
  const currentMode = isThemeMode(values.mode) ? values.mode : DEFAULT_MODE;
  const currentFont = isFontKey(values.font) ? values.font : DEFAULT_FONT;

  return (
    <form action={formAction} className="max-w-xl">
      <FieldGroup>
        {logoUrl && (
          <Field>
            <FieldLabel>Logo</FieldLabel>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Business logo"
              className="h-12 w-auto rounded"
            />
            <p className="text-xs text-muted-foreground">
              Managed on the Business Profile tab.
            </p>
          </Field>
        )}
        <Field>
          <FieldLabel>Theme</FieldLabel>
          <ThemeSwatchPicker
            name="theme"
            defaultValue={currentTheme}
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Applies for everyone — this is a business-wide setting, not a
            personal preference.
          </p>
        </Field>
        <Field className="max-w-xs">
          <FieldLabel htmlFor="mode">Mode</FieldLabel>
          <Select name="mode" defaultValue={currentMode} disabled={readOnly}>
            <SelectTrigger id="mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">Follow system</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Font</FieldLabel>
          <FontPicker
            name="font"
            defaultValue={currentFont}
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
