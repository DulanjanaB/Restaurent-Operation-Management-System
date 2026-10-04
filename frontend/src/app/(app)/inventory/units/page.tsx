import { getMe } from '@/lib/auth/dal';
import { getUnits } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { UnitFormDialog } from './unit-form-dialog';
import { UnitsTable } from './units-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function UnitsPage() {
  const [me, units] = await Promise.all([getMe(), getUnits()]);
  const canCreate = hasPermission(me, 'inventory.create');
  const canManage =
    hasPermission(me, 'inventory.update') &&
    hasPermission(me, 'inventory.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Units</>}
        description={<>Units of measure.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <UnitFormDialog />}
          </div>
        }
      />
      <UnitsTable units={units} canManage={canManage} />
    </div>
  );
}
