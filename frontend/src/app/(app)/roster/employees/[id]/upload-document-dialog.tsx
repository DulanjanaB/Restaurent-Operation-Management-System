'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { FileUploadField } from '@/components/shared/file-upload-field';
import { uploadEmployeeDocument } from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';
import type { DocumentType } from '@/lib/server/roster/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function UploadDocumentDialog({
  employeeId,
  documentTypes,
}: {
  employeeId: string;
  documentTypes: DocumentType[];
}) {
  const [open, setOpen] = useState(false);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const action = uploadEmployeeDocument.bind(null, employeeId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  const selectedType = documentTypes.find((type) => type.id === documentTypeId);
  // Backend does NOT enforce expiry_date when the document type requires
  // it — the frontend has to, per the Roster module's own gap.
  const expiryRequired = selectedType?.requires_expiry ?? false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Upload document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="document_type_id">Document type</FieldLabel>
              <Select
                name="document_type_id"
                value={documentTypeId}
                onValueChange={setDocumentTypeId}
                required
              >
                <SelectTrigger id="document_type_id">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>File</FieldLabel>
              <FileUploadField name="file_url" label="document" />
            </Field>
            <Field>
              <FieldLabel htmlFor="issue_date">Issue date</FieldLabel>
              <Input id="issue_date" name="issue_date" type="date" />
            </Field>
            <Field data-invalid={expiryRequired}>
              <FieldLabel htmlFor="expiry_date">
                Expiry date{expiryRequired ? ' (required)' : ''}
              </FieldLabel>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                required={expiryRequired}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" name="notes" rows={2} />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
