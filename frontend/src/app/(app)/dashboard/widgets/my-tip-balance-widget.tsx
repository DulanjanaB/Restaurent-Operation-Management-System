import { Wallet } from 'lucide-react';
import {
  getMyAllocations,
  getMyBalance,
} from '@/lib/server/tip-sharing/queries';
import { WidgetCard } from '../widget-card';
import { Money } from '@/components/shared/money';

// Self-service, zero permission — shown to every signed-in user. Accounts
// without a linked Employee record still get the card, with an explanation
// instead of an amount, since the tip system can only pay employees.
export async function MyTipBalanceWidget() {
  const [balance, allocations] = await Promise.all([
    getMyBalance().catch(() => null),
    getMyAllocations().catch(() => null),
  ]);

  if (balance === null) {
    return (
      <WidgetCard
        title="My Tip Amount"
        href="/tip-sharing/my-balance"
        icon={Wallet}
        tone="emerald"
      >
        <p className="text-2xl font-semibold text-muted-foreground">—</p>
        <p className="text-sm text-muted-foreground">
          No employee record is linked to your account yet.
        </p>
      </WidgetCard>
    );
  }

  const earned = (allocations ?? []).reduce(
    (sum, allocation) => sum + Number(allocation.amount ?? 0),
    0,
  );

  return (
    <WidgetCard
      title="My Tip Amount"
      href="/tip-sharing/my-balance"
      icon={Wallet}
      tone="emerald"
    >
      <p className="text-2xl font-semibold">
        <Money value={balance.balance} />
      </p>
      <p className="text-sm text-muted-foreground">
        Not yet paid out · Total earned <Money value={earned} />
      </p>
    </WidgetCard>
  );
}
