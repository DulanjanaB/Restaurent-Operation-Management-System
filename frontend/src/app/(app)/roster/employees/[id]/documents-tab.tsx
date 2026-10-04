import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { UploadDocumentDialog } from './upload-document-dialog';
import { DeleteDocumentButton } from './delete-document-button';
import {
  computeDocumentValidity,
  type DocumentType,
  type EmployeeDocument,
} from '@/lib/server/roster/types';

const VALIDITY_LABEL: Record<
  string,
  { label: string; variant: 'secondary' | 'destructive' | 'outline' }
> = {
  valid: { label: 'Valid', variant: 'secondary' },
  expiring_soon: { label: 'Expiring soon', variant: 'outline' },
  expired: { label: 'Expired', variant: 'destructive' },
  no_expiry: { label: 'No expiry', variant: 'outline' },
};

export function DocumentsTab({
  employeeId,
  documents,
  documentTypes,
  canManage,
}: {
  employeeId: string;
  documents: EmployeeDocument[];
  documentTypes: DocumentType[];
  canManage: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <UploadDocumentDialog
            employeeId={employeeId}
            documentTypes={documentTypes}
          />
        </div>
      )}
      {documents.length === 0 ? (
        <EmptyState title="No documents uploaded" />
      ) : (
        <ul className="divide-y rounded-md border">
          {documents.map((doc) => {
            const validity = computeDocumentValidity(doc.expiry_date);
            const { label, variant } = VALIDITY_LABEL[validity];
            return (
              <li
                key={doc.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {doc.document_type?.name ?? 'Document'}
                  </a>
                  {doc.expiry_date && (
                    <p className="text-sm text-muted-foreground">
                      Expires {doc.expiry_date}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={variant}>{label}</Badge>
                  {canManage && (
                    <DeleteDocumentButton
                      employeeId={employeeId}
                      documentId={doc.id}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
