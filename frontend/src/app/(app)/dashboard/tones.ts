export type Tone =
  'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal' | 'indigo' | 'slate';

// Full class names are written out so Tailwind can see them at build time.
export const TONE_STYLES: Record<
  Tone,
  { badge: string; accent: string; bar: string; dot: string; pill: string }
> = {
  sky: {
    badge: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    accent: 'from-sky-400 to-sky-600',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    pill: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  emerald: {
    badge:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    accent: 'from-emerald-400 to-emerald-600',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  violet: {
    badge:
      'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    accent: 'from-violet-400 to-violet-600',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    pill: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  },
  amber: {
    badge:
      'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    accent: 'from-amber-400 to-amber-600',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  rose: {
    badge: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    accent: 'from-rose-400 to-rose-600',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  teal: {
    badge: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
    accent: 'from-teal-400 to-teal-600',
    bar: 'bg-teal-500',
    dot: 'bg-teal-500',
    pill: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  },
  indigo: {
    badge:
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
    accent: 'from-indigo-400 to-indigo-600',
    bar: 'bg-indigo-500',
    dot: 'bg-indigo-500',
    pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  slate: {
    badge:
      'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-300',
    accent: 'from-slate-300 to-slate-500',
    bar: 'bg-slate-400',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  },
};
