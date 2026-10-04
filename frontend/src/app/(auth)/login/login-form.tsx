'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {};

const inputClass =
  'h-11 w-full rounded-md border border-[#cfe0f7] bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#0a72e8] focus:ring-2 focus:ring-[#0a72e8]/20 disabled:opacity-60';

export function LoginForm({
  next,
  expiredNotice,
}: {
  next?: string;
  expiredNotice?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (expiredNotice) {
      toast.error('Your session expired. Please log in again.');
    }
    // Only ever fires once per page load from the redirect that set
    // ?reason=expired — not re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="inline-block border-b-2 border-[#0a72e8] pb-1 text-2xl font-medium text-[#0a72e8]">
          Log in
        </h1>
      </div>

      {expiredNotice && (
        <p className="text-center text-sm text-slate-500">
          Your session expired. Please log in again.
        </p>
      )}

      <form action={formAction} className="mx-auto w-full max-w-xs space-y-5">
        <input type="hidden" name="next" value={next ?? '/dashboard'} />

        <div className="space-y-1.5">
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            name="username"
            placeholder="user name"
            autoComplete="username"
            required
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="password"
            autoComplete="current-password"
            required
            disabled={pending}
            className={inputClass}
          />
          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-40 rounded-md bg-[#0a72e8] text-base font-medium text-white shadow-md transition hover:bg-[#0863cc] disabled:opacity-60"
          >
            {pending ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  );
}
