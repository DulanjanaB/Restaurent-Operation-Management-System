import { getMe } from '@/lib/auth/dal';
import { getCustomers } from '@/lib/server/events/queries';
import { hasPermission } from '@/lib/permissions';
import { CustomerFormDialog } from './customer-form-dialog';
import { CustomersTable } from './customers-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function CustomersPage() {
  const [me, customers] = await Promise.all([getMe(), getCustomers()]);
  const canCreate = hasPermission(me, 'event.create');
  const canManage =
    hasPermission(me, 'event.update') && hasPermission(me, 'event.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="violet"
        title={<>Customers</>}
        description={
          <>Global customer directory — shared across every branch.</>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <CustomerFormDialog />}
          </div>
        }
      />
      <CustomersTable customers={customers} canManage={canManage} />
    </div>
  );
}
