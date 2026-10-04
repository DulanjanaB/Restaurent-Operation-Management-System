import { getExpiryAlertBatches } from '@/lib/server/food-preservation/queries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BatchesTable } from '../batches/batches-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function ExpiryAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const threshold = days ? Number(days) : 3;
  const batches = await getExpiryAlertBatches(threshold);

  return (
    <div className="space-y-6">
      <PageHeader
        tone="sky"
        title={<>Expiry Alerts</>}
        description={
          <>
            Active batches expiring within the selected window. Fully automatic
            — active batches past their expiry date flip to &quot;Expired&quot;
            on their own, no action needed here.
          </>
        }
      />

      <form method="get" className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="days">Days ahead</Label>
          <Input
            id="days"
            name="days"
            type="number"
            min="0"
            step="1"
            defaultValue={threshold}
            className="w-28"
          />
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <BatchesTable batches={batches} />
    </div>
  );
}
