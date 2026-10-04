'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { Badge } from '@/components/ui/badge';
import { DocumentTypeFormDialog } from './document-type-form-dialog';
import { deleteDocumentType } from '@/lib/server/roster/actions';
import type { DocumentType } from '@/lib/server/roster/types';

export function DocumentTypesTable({
  documentTypes,
  canManage,
}: {
  documentTypes: DocumentType[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<DocumentType, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        id: 'requires_expiry',
        header: 'Expiry required',
        cell: ({ row }) =>
          row.original.requires_expiry ? (
            <Badge variant="secondary">Required</Badge>
          ) : (
            <span className="text-muted-foreground">No</span>
          ),
      },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: DocumentType } }) => (
                <div className="flex justify-end gap-2">
                  <DocumentTypeFormDialog documentType={row.original} />
                  <DeleteButton
                    itemLabel={row.original.name}
                    onDelete={() => deleteDocumentType(row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<DocumentType, unknown>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={documentTypes}
      searchKey="name"
      searchPlaceholder="Search document types…"
      emptyTitle="No document types yet"
    />
  );
}
