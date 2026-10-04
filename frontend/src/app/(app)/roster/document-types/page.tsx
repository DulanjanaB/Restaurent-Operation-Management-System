import { getMe } from '@/lib/auth/dal';
import { getDocumentTypes } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { DocumentTypeFormDialog } from './document-type-form-dialog';
import { DocumentTypesTable } from './document-types-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function DocumentTypesPage() {
  const [me, documentTypes] = await Promise.all([getMe(), getDocumentTypes()]);
  const canCreate = hasPermission(me, 'roster.create');
  const canManage =
    hasPermission(me, 'roster.update') && hasPermission(me, 'roster.delete');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Document Types</>}
        description={
          <>
            Kinds of documents employees can upload (health cards, IDs,
            contracts).
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <DocumentTypeFormDialog />}
          </div>
        }
      />
      <DocumentTypesTable documentTypes={documentTypes} canManage={canManage} />
    </div>
  );
}
