import { getMe } from '@/lib/auth/dal';
import { hasPermission } from '@/lib/permissions';
import { AccessDenied } from '@/components/shared/access-denied';
import {
  getItemRequestCatalog,
  getItemRequests,
  getMyItemRequests,
} from '@/lib/server/inventory/queries';
import { ItemRequestDialog } from './item-request-dialog';
import { MyRequestsTable } from './my-requests-table';
import { DecisionQueue } from './decision-queue';
import { PageHeader } from '@/components/shared/page-header';

export default async function ItemRequestsPage() {
  const me = await getMe();
  const canRequest = hasPermission(me, 'inventory.item_request.create');
  const canDecide = hasPermission(me, 'inventory.approve');
  if (!canRequest && !canDecide) return <AccessDenied />;

  const [catalog, mine, all] = await Promise.all([
    canRequest ? getItemRequestCatalog() : null,
    canRequest ? getMyItemRequests() : [],
    canDecide ? getItemRequests() : [],
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        tone="amber"
        title={<>Item Requests</>}
        description={
          <>
            {canRequest
              ? 'Ask the store for ingredients and supplies you need for your shift.'
              : 'Review and issue stock requested by kitchen and dishwashing staff.'}
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {catalog && <ItemRequestDialog catalog={catalog} />}
          </div>
        }
      />

      {canRequest && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            My requests
          </h2>
          <MyRequestsTable requests={mine} />
        </section>
      )}

      {canDecide && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Requests
          </h2>
          <DecisionQueue requests={all} />
        </section>
      )}
    </div>
  );
}
