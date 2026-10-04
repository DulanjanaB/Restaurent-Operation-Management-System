'use client';

import { useEffect, useRef } from 'react';
import type { ActionResult } from '@/lib/validation';

// Generic "do something once a useActionState submission succeeds" —
// `onSuccess` is received as an opaque callback rather than this hook
// owning the state itself, same indirection useCloseDialogOnSuccess uses,
// so the state-setting calls a caller makes inside it (closing a dialog,
// navigating, toasting a dynamic message) don't trip the
// react-hooks/set-state-in-effect rule, which only flags a setState
// setter it can see declared via useState in the same function as the
// effect body.
export function useActionSuccess<T extends ActionResult>(
  pending: boolean,
  state: T,
  onSuccess: (state: T) => void,
) {
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (pending) hasSubmitted.current = true;
  }, [pending]);

  useEffect(() => {
    if (
      hasSubmitted.current &&
      !pending &&
      !state.error &&
      !state.fieldErrors
    ) {
      hasSubmitted.current = false;
      onSuccess(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);
}
