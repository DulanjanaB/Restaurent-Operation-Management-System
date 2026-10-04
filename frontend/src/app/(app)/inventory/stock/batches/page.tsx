import { getItems, getStockBatches } from '@/lib/server/inventory/queries';
import { BatchesTable } from './batches-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function StockBatchesPage() {
  const [batches, items] = await Promise.all([getStockBatches({}), getItems()]);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="amber"
        title={<>Stock Batches</>}
        description={<>Lots for items that track expiry.</>}
      />
      <BatchesTable batches={batches} items={items} />
    </div>
  );
}
