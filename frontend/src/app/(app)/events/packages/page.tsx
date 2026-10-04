import { getMe } from '@/lib/auth/dal';
import { getPackages } from '@/lib/server/events/queries';
import { hasPermission } from '@/lib/permissions';
import { PackageFormDialog } from './package-form-dialog';
import { PackagesTable } from './packages-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function PackagesPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const packages = await getPackages(branchId);
  const canCreate = hasPermission(me, 'event.create');
  const canManage =
    hasPermission(me, 'event.update') && hasPermission(me, 'event.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="violet"
        title={<>Packages</>}
        description={<>Pricing packages for events in your current branch.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <PackageFormDialog branchId={branchId} />}
          </div>
        }
      />
      <PackagesTable
        packages={packages}
        branchId={branchId}
        canManage={canManage}
      />
    </div>
  );
}
