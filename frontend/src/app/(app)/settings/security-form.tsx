'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { saveSecurity } from '@/lib/server/settings/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  LoginSettings,
  PasswordPolicy,
  SessionSettings,
} from '@/lib/server/settings/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function SecurityForm({
  passwordPolicy,
  sessionSettings,
  loginSettings,
}: {
  passwordPolicy: Partial<PasswordPolicy>;
  sessionSettings: Partial<SessionSettings>;
  loginSettings: Partial<LoginSettings>;
}) {
  const [state, formAction, pending] = useActionState(
    saveSecurity,
    initialState,
  );
  useActionToast(pending, state, 'Security settings saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <h3 className="text-sm font-semibold">Password policy</h3>
        <Field>
          <FieldLabel htmlFor="min_length">Minimum length</FieldLabel>
          <Input
            id="min_length"
            name="min_length"
            type="number"
            min={6}
            defaultValue={passwordPolicy.min_length ?? 8}
          />
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="require_uppercase"
            name="require_uppercase"
            defaultChecked={passwordPolicy.require_uppercase ?? true}
          />
          <FieldLabel htmlFor="require_uppercase">
            Require an uppercase letter
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="require_number"
            name="require_number"
            defaultChecked={passwordPolicy.require_number ?? true}
          />
          <FieldLabel htmlFor="require_number">Require a number</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="require_symbol"
            name="require_symbol"
            defaultChecked={passwordPolicy.require_symbol ?? false}
          />
          <FieldLabel htmlFor="require_symbol">Require a symbol</FieldLabel>
        </Field>
        <Field>
          <FieldLabel htmlFor="expiry_days">
            Password expires after (days)
          </FieldLabel>
          <Input
            id="expiry_days"
            name="expiry_days"
            type="number"
            min={0}
            defaultValue={passwordPolicy.expiry_days ?? 90}
          />
        </Field>

        <h3 className="pt-2 text-sm font-semibold">Sessions</h3>
        <Field>
          <FieldLabel htmlFor="timeout_minutes">
            Idle timeout (minutes)
          </FieldLabel>
          <Input
            id="timeout_minutes"
            name="timeout_minutes"
            type="number"
            min={5}
            defaultValue={sessionSettings.timeout_minutes ?? 60}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="max_concurrent_sessions">
            Max concurrent sessions
          </FieldLabel>
          <Input
            id="max_concurrent_sessions"
            name="max_concurrent_sessions"
            type="number"
            min={1}
            defaultValue={sessionSettings.max_concurrent_sessions ?? 3}
          />
        </Field>

        <h3 className="pt-2 text-sm font-semibold">Login</h3>
        <Field>
          <FieldLabel htmlFor="max_failed_attempts">
            Max failed login attempts
          </FieldLabel>
          <Input
            id="max_failed_attempts"
            name="max_failed_attempts"
            type="number"
            min={1}
            defaultValue={loginSettings.max_failed_attempts ?? 5}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lockout_duration_minutes">
            Lockout duration (minutes)
          </FieldLabel>
          <Input
            id="lockout_duration_minutes"
            name="lockout_duration_minutes"
            type="number"
            min={1}
            defaultValue={loginSettings.lockout_duration_minutes ?? 15}
          />
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="mfa_required"
            name="mfa_required"
            defaultChecked={loginSettings.mfa_required ?? false}
          />
          <FieldLabel htmlFor="mfa_required">Require MFA</FieldLabel>
        </Field>

        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </FieldGroup>
    </form>
  );
}
