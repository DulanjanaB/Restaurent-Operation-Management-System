import { Coins } from 'lucide-react';
import { getMe } from '@/lib/auth/dal';
import { getTipPools } from '@/lib/server/tip-sharing/queries';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/shared/page-header';
import { PoolCreateDialog } from './pool-create-dialog';
import { PoolsTable } from './pools-table';

export default async function TipPoolsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const pools = await getTipPools(branchId);
  const canCreate = hasPermission(me, 'tip.create');
  const canUpdate = hasPermission(me, 'tip.update');
  const canDelete = hasPermission(me, 'tip.delete');
  const open = pools.filter((pool) => pool.status === 'open').length;
  const calculated = pools.length - open;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Coins}
        tone="emerald"
        title="Tip pools"
        description="Daily tip pools for your current branch."
        action={
          canCreate ? <PoolCreateDialog branchId={branchId} /> : undefined
        }
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">
              {pools.length}
            </p>
            <p className="text-xs text-white/80">Total pools</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">{open}</p>
            <p className="text-xs text-white/80">Open</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <p className="text-2xl font-semibold tabular-nums">{calculated}</p>
            <p className="text-xs text-white/80">Calculated</p>
          </div>
        </div>
      </PageHeader>
      <PoolsTable pools={pools} canUpdate={canUpdate} canDelete={canDelete} />
    </div>
  );
}
