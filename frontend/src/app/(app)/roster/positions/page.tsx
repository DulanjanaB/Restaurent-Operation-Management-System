import { getMe } from '@/lib/auth/dal';
import { getPositions } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { PositionFormDialog } from './position-form-dialog';
import { PositionsTable } from './positions-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function PositionsPage() {
  const [me, positions] = await Promise.all([getMe(), getPositions()]);
  const canCreate = hasPermission(me, 'roster.create');
  const canManage =
    hasPermission(me, 'roster.update') && hasPermission(me, 'roster.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Positions</>}
        description={<>Job titles used across all branches.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <PositionFormDialog />}
          </div>
        }
      />
      <PositionsTable positions={positions} canManage={canManage} />
    </div>
  );
}
