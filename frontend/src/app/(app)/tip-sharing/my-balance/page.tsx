import { Wallet } from 'lucide-react';
import {
  getMyAllocations,
  getMyBalance,
} from '@/lib/server/tip-sharing/queries';
import { ApiError } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Money } from '@/components/shared/money';

// Self-service — GET /tip/my-balance and /tip/my-allocations need zero
// permissions, just an authenticated session with a linked Employee
// record. See docs/tip-sharing-design.md's self-service note.
export default async function MyTipBalancePage() {
  let balance;
  try {
    balance = await getMyBalance();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="space-y-6">
          <EmptyState
            title="No employee record linked"
            description="Your user account isn't linked to an employee record, so there's no tip balance to show."
          />
        </div>
      );
    }
    throw error;
  }

  const allocations = await getMyAllocations();
  const earned = allocations.reduce(
    (sum, allocation) => sum + Number(allocation.amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        tone="emerald"
        title="My tip balance"
        description="Your share of calculated tip pools, not yet paid out."
      >
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
            <p className="text-3xl font-semibold tabular-nums">
              <Money value={balance.balance} />
            </p>
            <p className="text-xs text-white/80">Unpaid balance</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
            <p className="text-3xl font-semibold tabular-nums">
              <Money value={earned} />
            </p>
            <p className="text-xs text-white/80">Total earned</p>
          </div>
        </div>
      </PageHeader>

      <div className="space-y-3 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5">
        <h2 className="font-semibold">History</h2>
        {allocations.length === 0 ? (
          <EmptyState title="No allocations yet" />
        ) : (
          <ul className="divide-y">
            {allocations.map((allocation) => (
              <li
                key={allocation.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-semibold">{allocation.tip_pool?.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {allocation.percentage}% share
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {allocation.amount === null ? (
                    <Badge variant="outline">Pool not calculated yet</Badge>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Money value={allocation.amount} />
                    </span>
                  )}
                  {allocation.tip_payout_id && (
                    <Badge variant="secondary">Paid out</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
