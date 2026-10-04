import { cn } from '@/lib/utils';

// The shared page banner. Pages pass their title, a one-line description,
// an optional icon and any primary action. Tone sets the gradient so each
// module can keep its own colour.
const TONES = {
  indigo: 'from-indigo-600 via-violet-600 to-fuchsia-600',
  teal: 'from-teal-600 via-cyan-600 to-sky-600',
  amber: 'from-amber-500 via-orange-500 to-rose-500',
  emerald: 'from-emerald-600 via-teal-600 to-cyan-600',
  rose: 'from-rose-600 via-pink-600 to-fuchsia-600',
  sky: 'from-sky-600 via-blue-600 to-indigo-600',
  violet: 'from-violet-600 via-purple-600 to-fuchsia-600',
  slate: 'from-slate-700 via-slate-600 to-indigo-700',
} as const;

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  tone = 'indigo',
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  tone?: keyof typeof TONES;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 text-white shadow-lg',
        TONES[tone],
      )}
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <Icon className="size-6" />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-white/80">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children && <div className="relative mt-6">{children}</div>}
    </div>
  );
}
