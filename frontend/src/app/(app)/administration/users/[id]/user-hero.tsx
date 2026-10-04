import {
  Building2,
  Globe2,
  KeyRound,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STAT_STYLES = {
  sky: 'from-sky-500 to-cyan-400',
  emerald: 'from-emerald-500 to-teal-400',
  amber: 'from-amber-500 to-orange-400',
  violet: 'from-violet-500 to-fuchsia-500',
} as const;

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone: keyof typeof STAT_STYLES;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div
        className={cn(
          'absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-15',
          STAT_STYLES[tone],
        )}
      />
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          STAT_STYLES[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function UserHero({
  name,
  email,
  active,
  primaryBranch,
  roleCount,
  branchNames,
  allBranches,
  overrideCount,
  isSystemOwner,
}: {
  name: string;
  email: string;
  active: boolean;
  primaryBranch: string;
  roleCount: number;
  branchNames: string[];
  allBranches: boolean;
  overrideCount: number;
  isSystemOwner: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute right-32 -bottom-20 size-44 rounded-full bg-white/10"
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-semibold ring-4 ring-white/30">
            {initials(name) || <UserRound className="size-9" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  active
                    ? 'bg-emerald-400/25 text-white ring-1 ring-emerald-200/60'
                    : 'bg-white/20 text-white/80 ring-1 ring-white/30',
                )}
              >
                {active ? 'Active' : 'Inactive'}
              </span>
              {isSystemOwner && (
                <span className="flex items-center gap-1 rounded-full bg-amber-300/25 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-amber-200/60">
                  <ShieldCheck className="size-3" />
                  System owner
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-white/80">{email}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <Building2 className="size-4" />
              Primary branch:{' '}
              <span className="font-medium text-white">{primaryBranch}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Roles assigned"
          value={roleCount}
          hint={roleCount === 1 ? '1 role grant' : `${roleCount} role grants`}
          icon={ShieldCheck}
          tone="sky"
        />
        <Stat
          label="Branch access"
          value={allBranches ? 'All' : branchNames.length}
          hint={
            allBranches
              ? 'Every branch'
              : branchNames.length === 1
                ? 'One branch'
                : 'Branches'
          }
          icon={Globe2}
          tone="emerald"
        />
        <Stat
          label="Permission overrides"
          value={overrideCount}
          hint={
            overrideCount === 0
              ? 'Using role defaults'
              : 'Custom grants or denies'
          }
          icon={KeyRound}
          tone="amber"
        />
        <Stat
          label="Account"
          value={active ? 'Enabled' : 'Disabled'}
          hint={active ? 'Can sign in' : 'Cannot sign in'}
          icon={UserRound}
          tone="violet"
        />
      </div>

      {branchNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
          <span className="mr-1 text-sm font-medium text-muted-foreground">
            Works in
          </span>
          {(allBranches ? ['All branches'] : branchNames).map((name, index) => (
            <span
              key={name}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm',
                [
                  'bg-sky-500',
                  'bg-emerald-500',
                  'bg-violet-500',
                  'bg-amber-500',
                  'bg-rose-500',
                ][index % 5],
              )}
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
