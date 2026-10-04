import { getBarSales } from '@/lib/server/bar/queries';
import { HistoryTable } from './history-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function BarSalesHistoryPage() {
  const sales = await getBarSales();

  return (
    <div className="space-y-4">
      <PageHeader
        tone="rose"
        title={<>Sales History</>}
        description={<>All recorded bar sales.</>}
      />
      <HistoryTable sales={sales} />
    </div>
  );
}
