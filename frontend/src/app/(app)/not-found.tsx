import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

// Scoped to the authenticated shell so notFound() calls from any page
// (e.g. a deleted batch/event/recipe id) keep the sidebar/topbar mounted —
// the layout persists, only this replaces the page content, same pattern
// as (app)/error.tsx and (app)/loading.tsx.
export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <FileQuestion className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Not found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This may have been deleted, or the link may be out of date.
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
