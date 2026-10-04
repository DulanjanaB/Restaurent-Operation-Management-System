import { Wallet } from 'lucide-react';
import { getMe } from '@/lib/auth/dal';
import { getEmployees } from '@/lib/server/roster/queries';
import { getEmployeeBalance } from '@/lib/server/tip-sharing/queries';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/shared/page-header';
import { BalancesTable } from './balances-table';
import { Money } from '@/components/shared/money';

// No bulk "all balances" endpoint exists on the backend — this fetches
// each employee's balance individually (GET /tip/employees/:id/balance),
// which assumes whoever holds tip.view also holds roster.view to see the
// employee list in the first place. Reasonable for how these roles would
// actually be composed (a tip-managing supervisor needs to know who their
// staff are), but worth knowing if that assumption ever needs revisiting.
export default async function TipBalancesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const employees = await getEmployees(branchId);

  const balances = await Promise.all(
    employees.map((employee) => getEmployeeBalance(employee.id)),
  );
  const rows = employees.map((employee, index) => ({
    employeeId: employee.id,
    name: employee.name,
    employeeCode: employee.employee_code,
    balance: balances[index].balance,
  }));

  const canPayout = hasPermission(me, 'tip.payout');
  const totalUnpaid = rows.reduce((sum, row) => sum + Number(row.balance), 0);
  const owing = rows.filter((row) => Number(row.balance) > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        tone="emerald"
        title="Unpaid tip balances"
        description="Every employee's calculated, not-yet-paid-out tip balance."
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">
              <Money value={totalUnpaid} />
            </p>
            <p className="text-xs text-white/80">Total unpaid</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">{owing}</p>
            <p className="text-xs text-white/80">Owed to staff</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">{rows.length}</p>
            <p className="text-xs text-white/80">Employees</p>
          </div>
        </div>
      </PageHeader>
      <BalancesTable rows={rows} canPayout={canPayout} />
    </div>
  );
}
