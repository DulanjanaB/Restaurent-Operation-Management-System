'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { NAV_GROUPS } from './nav-config';

// Client component on purpose: the (app) layout doesn't re-render on
// client-side navigation, so a server-read pathname would stay on the first
// page visited. usePathname() always reflects the current URL.
const NAV_LABELS = new Map(
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.href, item.label] as const),
  ),
);

const ID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f-]{27}$|^\d+$/i;

function humanize(segment: string): string {
  const text = segment.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function BackBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0 || pathname === '/dashboard') return null;

  const crumbs = [
    { href: '/dashboard', label: 'Dashboard' },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const label = ID_SEGMENT.test(segment)
        ? 'Details'
        : (NAV_LABELS.get(href) ?? humanize(segment));
      return { href, label };
    }),
  ];

  const ancestors = crumbs
    .slice(0, -1)
    .filter((crumb) => NAV_LABELS.has(crumb.href));
  const parent = ancestors[ancestors.length - 1] ?? crumbs[0];

  return (
    <div className="no-print mb-5 flex flex-wrap items-center gap-3 text-sm">
      <Link
        href={parent.href}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
      >
        <ArrowLeft className="size-4" />
        Back to {parent.label}
      </Link>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-muted-foreground"
      >
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5" />}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition hover:text-foreground hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
