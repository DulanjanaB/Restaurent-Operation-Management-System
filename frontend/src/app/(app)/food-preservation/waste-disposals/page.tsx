import { getMe } from '@/lib/auth/dal';
import {
  getBatches,
  getWasteDisposals,
} from '@/lib/server/food-preservation/queries';
import { hasPermission } from '@/lib/permissions';
import { WasteDisposalRequestDialog } from './waste-disposal-request-dialog';
import { WasteDisposalQueue } from './waste-disposal-queue';
import { PageHeader } from '@/components/shared/page-header';

export default async function WasteDisposalsPage() {
  const [me, requests, batches] = await Promise.all([
    getMe(),
    getWasteDisposals(),
    getBatches({}),
  ]);
  const disposableBatches = batches.filter(
    (batch) => batch.status === 'active' || batch.status === 'expired',
  );
  const canCreate = hasPermission(me, 'food_preservation.create');
  const canDecide = hasPermission(me, 'food_preservation.approve');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sky"
        title={<>Waste Disposals</>}
        description={
          <>Requests to write off spoiled, expired, or damaged batches.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <WasteDisposalRequestDialog batches={disposableBatches} />
            )}
          </div>
        }
      />
      <WasteDisposalQueue requests={requests} canDecide={canDecide} />
    </div>
  );
}
