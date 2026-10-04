import type { ColumnDef } from '@tanstack/react-table';
import { getPermissions } from '@/lib/server/administration/queries';
import { DataTable } from '@/components/shared/data-table';
import type { Permission } from '@/lib/server/administration/types';
import { PageHeader } from '@/components/shared/page-header';

// Read-only — the seeded permission catalog, never created/edited through
// the UI (see docs/rbac-design.md). The Role detail page's permission
// checklist reads this same list to know every checkbox it can offer.
export default async function PermissionsPage() {
  const permissions = await getPermissions();

  const columns: ColumnDef<Permission, unknown>[] = [
    { accessorKey: 'key', header: 'Key' },
    { accessorKey: 'module', header: 'Module' },
    { accessorKey: 'resource', header: 'Resource' },
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        tone="indigo"
        title={<>Permissions</>}
        description={
          <>The full catalog of permission keys the system understands.</>
        }
      />
      <DataTable
        columns={columns}
        data={permissions}
        searchKey="key"
        searchPlaceholder="Search permissions…"
      />
    </div>
  );
}
