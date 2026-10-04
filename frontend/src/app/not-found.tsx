import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

// Root-level catch-all for a URL that matches no route at all (a typo, a
// stale bookmark, a link to something since removed). Pages that call
// notFound() from inside the authenticated shell hit (app)/not-found.tsx
// instead, which keeps the sidebar/topbar mounted — this one renders
// standalone since it has no session/layout context to assume.
export default function GlobalNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-center">
      <FileQuestion className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Page not found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
