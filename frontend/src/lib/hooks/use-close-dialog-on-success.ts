'use client';

import { useEffect, useRef } from 'react';
import type { ActionResult } from '@/lib/validation';

// Shared by every dialog-based create/edit form (Branches, and every
// master-data CRUD dialog in later phases): closes the dialog once a
// useActionState submission completes with no error, and leaves it open
// (so the user sees the error) otherwise.
export function useCloseDialogOnSuccess(
  pending: boolean,
  state: ActionResult,
  setOpen: (open: boolean) => void,
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
      setOpen(false);
      hasSubmitted.current = false;
    }
  }, [pending, state, setOpen]);
}
