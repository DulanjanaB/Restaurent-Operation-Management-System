'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

// Next.js strips thrown error details down to a digest before they reach a
// client error boundary, so we can't reliably tell an ApiError(403) apart
// from a genuine crash here — the message stays deliberately generic. Most
// 403s should never reach this at all (the sidebar hides nav items the
// user lacks permission for), but direct navigation to a URL they don't
// have access to still needs a real page instead of Next's raw error
// overlay. See Phase 12 in the plan for further polish.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Couldn&apos;t load this page</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          You may not have access to this, or something went wrong. Try going
          back, or contact an administrator if this keeps happening.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild>
          <a href="/dashboard">Back to dashboard</a>
        </Button>
      </div>
    </div>
  );
}
