import { Skeleton } from '@/components/ui/skeleton';

// One shared loading fallback for every route under the authenticated
// shell — (app)/layout.tsx keeps the sidebar/topbar mounted and swaps only
// this in for the page content while a route's Server Components fetch.
export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
