import { hasPermission } from '@/lib/permissions';
import { getEmployees } from '@/lib/server/roster/queries';
import { getEmployeeBalance } from '@/lib/server/tip-sharing/queries';
import { HandCoins } from 'lucide-react';
import { WidgetCard } from '../widget-card';
import type { Me } from '@/lib/auth/dal';
import { Money } from '@/components/shared/money';

// Same N+1 pattern as the Unpaid Balances page (no bulk endpoint exists) —
// fine for a branch-sized employee list, same tradeoff already accepted
// there.
export async function UnpaidTipsWidget({ me }: { me: Me }) {
  if (!hasPermission(me, 'tip.view') || !hasPermission(me, 'roster.view'))
    return null;

  const employees = await getEmployees(me.current_branch_id).catch(() => null);
  if (employees === null || employees.length === 0) return null;

  const balances = await Promise.all(
    employees.map((employee) =>
      getEmployeeBalance(employee.id).catch(() => null),
    ),
  );
  const unpaid = balances.filter(
    (balance) => balance && Number(balance.balance) > 0,
  );
  if (unpaid.length === 0) return null;

  const total = unpaid.reduce(
    (sum, balance) => sum + Number(balance!.balance),
    0,
  );

  return (
    <WidgetCard
      title="Unpaid Tip Balances"
      href="/tip-sharing/balances"
      icon={HandCoins}
      tone="amber"
    >
      <p className="text-2xl font-semibold">
        <Money value={total} />
      </p>
      <p className="text-sm text-muted-foreground">
        Across {unpaid.length} employees
      </p>
    </WidgetCard>
  );
}
