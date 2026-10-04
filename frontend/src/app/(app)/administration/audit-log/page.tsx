import { getMe } from '@/lib/auth/dal';
import { getAuditLog } from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuditLogTable } from '@/components/shared/audit-log-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const canExport = hasPermission(me, 'audit.export');

  const entries = await getAuditLog({
    entityType: params.entity_type,
    dateFrom: params.date_from,
    dateTo: params.date_to,
  });

  const exportQuery = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ).toString();

  return (
    <div className="space-y-4">
      <PageHeader
        tone="indigo"
        title={<>Audit Log</>}
        description={<>Every recorded action across the system.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canExport && (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={`/api/audit-log/export?${exportQuery}&format=csv`}>
                    Export CSV
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/api/audit-log/export?${exportQuery}&format=excel`}>
                    Export Excel
                  </a>
                </Button>
              </div>
            )}
          </div>
        }
      />
      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_from">From</Label>
          <Input
            id="date_from"
            type="date"
            name="date_from"
            defaultValue={params.date_from ?? ''}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_to">To</Label>
          <Input
            id="date_to"
            type="date"
            name="date_to"
            defaultValue={params.date_to ?? ''}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="entity_type">Entity type</Label>
          <Input
            id="entity_type"
            name="entity_type"
            placeholder="e.g. User, Role"
            defaultValue={params.entity_type ?? ''}
            className="w-40"
          />
        </div>
        <Button type="submit">Apply</Button>
      </form>
      <AuditLogTable entries={entries} />
    </div>
  );
}
