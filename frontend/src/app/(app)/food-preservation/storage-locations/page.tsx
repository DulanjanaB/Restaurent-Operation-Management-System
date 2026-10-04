import { getMe } from '@/lib/auth/dal';
import { getStorageLocations } from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { StorageLocationFormDialog } from './storage-location-form-dialog';
import { StorageLocationsTable } from './storage-locations-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StorageLocationsPage() {
  const me = await getMe();
  const branchId = me!.current_branch_id;
  const locations = await getStorageLocations(branchId);
  const canCreate = hasPermission(me, 'food_preservation.create');
  const canManage =
    hasPermission(me, 'food_preservation.update') &&
    hasPermission(me, 'food_preservation.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sky"
        title={<>Storage Locations</>}
        description={
          <>Freezers, chillers, and dry stores in your current branch.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <StorageLocationFormDialog branchId={branchId} />}
          </div>
        }
      />
      <StorageLocationsTable
        locations={locations}
        branchId={branchId}
        canManage={canManage}
      />
    </div>
  );
}
