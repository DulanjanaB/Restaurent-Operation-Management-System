'use client';

import { useMemo, useState } from 'react';
import { useActionState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { addExpense, removeExpense } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type { EventExpense } from '@/lib/server/events/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';
import { Money } from '@/components/shared/money';

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function AddExpenseDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const action = addExpense.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.category}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Catering"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.category
                    ? [{ message: state.fieldErrors.category }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.amount}>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.amount
                    ? [{ message: state.fieldErrors.amount }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="incurred_at">Date incurred</FieldLabel>
              <Input
                id="incurred_at"
                name="incurred_at"
                type="date"
                defaultValue={today()}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea id="description" name="description" rows={2} />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Adding…' : 'Add'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesTab({
  eventId,
  expenses,
  canManage,
}: {
  eventId: string;
  expenses: EventExpense[];
  canManage: boolean;
}) {
  const columns = useMemo<ColumnDef<EventExpense, unknown>[]>(
    () => [
      { accessorKey: 'incurred_at', header: 'Date' },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => <Money value={getValue() as string} />,
      },
      { accessorKey: 'description', header: 'Description' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: EventExpense } }) => (
                <div className="flex justify-end">
                  <DeleteButton
                    itemLabel={row.original.category}
                    onDelete={() => removeExpense(eventId, row.original.id)}
                  />
                </div>
              ),
            } satisfies ColumnDef<EventExpense, unknown>,
          ]
        : []),
    ],
    [canManage, eventId],
  );

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <AddExpenseDialog eventId={eventId} />
        </div>
      )}
      <DataTable
        columns={columns}
        data={expenses}
        emptyTitle="No expenses recorded yet"
      />
    </div>
  );
}
