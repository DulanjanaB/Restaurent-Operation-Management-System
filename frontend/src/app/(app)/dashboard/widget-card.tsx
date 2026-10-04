import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_STYLES, type Tone } from './tones';

// Generic shell every dashboard widget renders through — keeps the grid
// visually consistent regardless of what data a given widget shows. An
// alert always wins over the tone so attention items stand out.
export function WidgetCard({
  title,
  href,
  icon: Icon,
  alert,
  tone = 'indigo',
  children,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  alert?: boolean;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const style = TONE_STYLES[alert ? 'rose' : tone];

  return (
    <Link
      href={href}
      className="group relative block h-full overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          style.accent,
        )}
      />
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-xl',
            style.badge,
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-5 space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        {children}
      </div>
    </Link>
  );
}
