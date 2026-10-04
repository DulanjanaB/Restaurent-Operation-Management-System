import { getMe } from '@/lib/auth/dal';
import { getItems, getWarehouses } from '@/lib/server/inventory/queries';
import { StockIssueForm } from './stock-issue-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockIssuePage() {
  const me = await getMe();
  const [items, warehouses] = await Promise.all([
    getItems(),
    getWarehouses(me!.current_branch_id),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="rose"
        title={<>Stock Issue</>}
        description={<>Request stock from Main Store to the Bar Store.</>}
      />
      <StockIssueForm items={items} warehouses={warehouses} />
    </div>
  );
}
