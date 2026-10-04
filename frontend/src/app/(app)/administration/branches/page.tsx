import { getMe } from '@/lib/auth/dal';
import { getBranches } from '@/lib/server/administration/queries';
import { hasPermission } from '@/lib/permissions';
import { BranchFormDialog } from './branch-form-dialog';
import { BranchesTable } from './branches-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function BranchesPage() {
  const [me, branches] = await Promise.all([getMe(), getBranches()]);
  const canCreate = hasPermission(me, 'administration.branch.create');
  const canUpdate = hasPermission(me, 'administration.branch.update');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="indigo"
        title={<>Branches</>}
        description={<>The physical locations this system operates across.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <BranchFormDialog />}
          </div>
        }
      />
      <BranchesTable branches={branches} canUpdate={canUpdate} />
    </div>
  );
}
