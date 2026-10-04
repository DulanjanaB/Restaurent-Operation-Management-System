import { notFound } from 'next/navigation';
import { Coins } from 'lucide-react';
import { getMe } from '@/lib/auth/dal';
import {
  getSuggestedParticipants,
  getTipPool,
} from '@/lib/server/tip-sharing/queries';
import { getEmployees } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { StatusStepper } from '@/components/shared/status-stepper';
import { PageHeader } from '@/components/shared/page-header';
import { AddParticipantDialog } from './add-participant-dialog';
import { ParticipantsList } from './participants-list';
import { CalculateButton } from './calculate-button';
import { EditAmountForm } from './edit-amount-form';
import { DeletePoolButton } from './delete-pool-button';
import { Money } from '@/components/shared/money';

const STEPS = [
  { key: 'open', label: 'Open' },
  { key: 'calculated', label: 'Calculated' },
];

export default async function TipPoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let pool;
  try {
    pool = await getTipPool(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const locked = pool.status === 'calculated';
  const canManage = hasPermission(me, 'tip.update');
  const canCalculate = hasPermission(me, 'tip.calculate') && !locked;
  const canDelete = hasPermission(me, 'tip.delete') && !locked;

  const [suggested, employees] = await Promise.all([
    locked ? Promise.resolve([]) : getSuggestedParticipants(id),
    getEmployees(pool.branch_id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Coins}
        tone="emerald"
        title={`Tip pool · ${pool.date}`}
        description={
          locked
            ? 'Calculated — amounts are final and locked.'
            : 'Open — adjust the total and participants, then calculate.'
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCalculate && <CalculateButton poolId={pool.id} />}
            {canDelete && (
              <DeletePoolButton poolId={pool.id} date={pool.date} />
            )}
          </div>
        }
      >
        <StatusStepper steps={STEPS} current={pool.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
            <p className="text-sm font-medium text-muted-foreground">
              Total amount
            </p>
            {!locked && canManage ? (
              <div className="mt-3">
                <EditAmountForm
                  poolId={pool.id}
                  totalAmount={pool.total_amount}
                />
              </div>
            ) : (
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {pool.total_amount}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
            <p className="text-sm font-medium text-muted-foreground">
              Participants
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {pool.allocations.length}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Participants</h2>
            {!locked && canManage && (
              <AddParticipantDialog
                poolId={pool.id}
                suggested={suggested}
                allEmployees={employees}
              />
            )}
          </div>
          <ParticipantsList
            poolId={pool.id}
            allocations={pool.allocations}
            locked={locked}
            canManage={canManage}
          />
        </div>
      </div>
    </div>
  );
}
