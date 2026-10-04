'use client';

import { DeleteButton } from '@/components/shared/delete-button';
import { deleteEmployeeDocument } from '@/lib/server/roster/actions';

export function DeleteDocumentButton({
  employeeId,
  documentId,
}: {
  employeeId: string;
  documentId: string;
}) {
  return (
    <DeleteButton
      itemLabel="this document"
      onDelete={() => deleteEmployeeDocument(employeeId, documentId)}
    />
  );
}
