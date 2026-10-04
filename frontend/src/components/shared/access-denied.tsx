import { ShieldAlert } from 'lucide-react';

// Rendered inline by a page that catches its own ApiError(403) — the
// preferred pattern over letting it bubble to (app)/error.tsx, since Next.js
// strips thrown error details down to an opaque digest before they reach a
// client error boundary (confirmed: only a generic "API request failed
// with status 403" message survives, and only in dev — production builds
// redact even that). A page that knows exactly why access was denied
// should say so directly instead of relying on the generic boundary.
export function AccessDenied({
  description = "You don't have the required permission to view this.",
}: {
  description?: string;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">You don&apos;t have access to this</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
