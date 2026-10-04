import { getMe } from '@/lib/auth/dal';
import { getEmployees } from '@/lib/server/roster/queries';
import {
  getBatches,
  getPreservedItems,
  getStorageLocations,
} from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { BatchCreateDialog } from './batch-create-dialog';
import { BatchesTable } from './batches-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function BatchesPage() {
  const me = await getMe();
  const [batches, preservedItems, storageLocations, employees] =
    await Promise.all([
      getBatches({}),
      getPreservedItems(),
      getStorageLocations(me!.current_branch_id),
      getEmployees(me!.current_branch_id).catch(() => []),
    ]);
  const canCreate = hasPermission(me, 'food_preservation.create');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sky"
        title={<>Batches</>}
        description={
          <>Preserved item batches — codes are generated automatically.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <BatchCreateDialog
                preservedItems={preservedItems}
                storageLocations={storageLocations}
                employees={employees}
              />
            )}
          </div>
        }
      />
      <BatchesTable batches={batches} />
    </div>
  );
}
