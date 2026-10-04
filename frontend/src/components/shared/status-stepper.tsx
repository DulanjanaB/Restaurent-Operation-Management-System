import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  key: string;
  label: string;
}

// Reused across every status pipeline in the app (Event 5-state, Batch
// 4-state, RosterPeriod 2-state, StockTransfer 5-state, PurchaseOrder
// 6-state, TipPool 2-state, ChecklistRecord 2-state). `terminal` marks a
// branch-off state (e.g. cancelled/rejected) rendered separately from the
// linear progression rather than as if it were the next step.
export function StatusStepper({
  steps,
  current,
  terminal,
}: {
  steps: StepperStep[];
  current: string;
  terminal?: { key: string; label: string } | null;
}) {
  const currentIndex = steps.findIndex((step) => step.key === current);
  const isTerminal = terminal && terminal.key === current;

  if (isTerminal) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30">
        <X className="size-3.5" />
        {terminal.label}
      </span>
    );
  }

  return (
    <ol className="flex flex-wrap items-center gap-1">
      {steps.map((step, index) => {
        const done = currentIndex >= 0 && index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-1">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
                active &&
                  'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm',
                done &&
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
                !active && !done && 'bg-muted/60 text-muted-foreground',
              )}
            >
              {done && <Check className="size-3" />}
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4 rounded-full',
                  done ? 'bg-emerald-300' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
