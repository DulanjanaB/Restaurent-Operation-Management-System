'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/lib/validation';

// Shared by every inline (non-dialog) useActionState form: toasts success
// or error once per real submit attempt, ignoring the initial render.
export function useActionToast(
  pending: boolean,
  state: ActionResult,
  successMessage: string,
) {
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (pending) hasSubmitted.current = true;
  }, [pending]);

  useEffect(() => {
    if (!hasSubmitted.current || pending) return;
    if (state.error) {
      toast.error(state.error);
    } else if (!state.fieldErrors) {
      toast.success(successMessage);
    }
    hasSubmitted.current = false;
    // successMessage is stable per call site; only re-run on actual state
    // transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);
}
