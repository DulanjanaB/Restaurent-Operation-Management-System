import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone = 'default' | 'success' | 'warning' | 'destructive';

const TONE_CLASSES: Record<StatusTone, string> = {
  default:
    'bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  success:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  warning:
    'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  destructive:
    'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
};

const DOT_CLASSES: Record<StatusTone, string> = {
  default: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-rose-500',
};

// Generic status pill reused wherever a record has a status enum (Stock,
// Batch, Transfer, PurchaseOrder, Event, ...). Callers map their own
// status string to a label + tone via `resolve`.
export function StatusBadge({
  status,
  resolve,
}: {
  status: string;
  resolve: (status: string) => { label: string; tone: StatusTone };
}) {
  const { label, tone } = resolve(status);
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border-0 font-medium', TONE_CLASSES[tone])}
    >
      <span className={cn('size-1.5 rounded-full', DOT_CLASSES[tone])} />
      {label}
    </Badge>
  );
}
