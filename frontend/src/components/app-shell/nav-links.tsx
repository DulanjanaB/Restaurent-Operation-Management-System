'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { NAV_GROUPS, type NavItem } from './nav-config';
import { hasAnyPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Me } from '@/lib/auth/dal';

// Shared by the desktop Sidebar and the mobile Sheet nav. Each category is
// a collapsible group: it opens by itself when it contains the current page,
// and the user can open or close any group. Client component because the
// open state and the active link come from the browser.
export function NavLinks({
  me,
  onNavigate,
}: {
  me: Me;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_GROUPS.map((group, index) => {
        const items = group.items.filter(
          (item) => !item.permissions || hasAnyPermission(me, item.permissions),
        );
        if (items.length === 0) return null;
        return (
          <NavGroup
            key={group.label || `group-${index}`}
            label={group.label}
            items={items}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
  );
}

function NavGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const containsActive = items.some((item) => isActive(item.href));
  // `null` means the user hasn't toggled it, so the default follows the page.
  const [manual, setManual] = useState<boolean | null>(null);
  const open = manual ?? containsActive;

  return (
    <div>
      {label ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setManual(!open)}
          className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary/70 transition hover:bg-primary/5 hover:text-primary"
        >
          {label}
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform',
              !open && '-rotate-90',
            )}
          />
        </button>
      ) : null}
      {(open || !label) && (
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-medium transition',
                  active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-foreground/80 hover:bg-primary/5 hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg transition',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
