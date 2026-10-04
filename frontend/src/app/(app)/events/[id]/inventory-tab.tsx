'use client';

import { useMemo, useState } from 'react';
import { useActionState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { DeleteButton } from '@/components/shared/delete-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  addInventoryRequirement,
  issueInventoryRequirement,
  removeInventoryRequirement,
} from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type { EventInventoryRequirement } from '@/lib/server/events/types';
import type { Item, Warehouse } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

function AddRequirementDialog({
  eventId,
  items,
}: {
  eventId: string;
  items: Item[];
}) {
  const [open, setOpen] = useState(false);
  const action = addInventoryRequirement.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add requirement</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add inventory requirement</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.inventory_item_id}>
              <FieldLabel htmlFor="inventory_item_id">Item</FieldLabel>
              <Select name="inventory_item_id" required>
                <SelectTrigger id="inventory_item_id">
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.quantity_required}>
              <FieldLabel htmlFor="quantity_required">
                Quantity required
              </FieldLabel>
              <Input
                id="quantity_required"
                name="quantity_required"
                type="number"
                step="0.001"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.quantity_required
                    ? [{ message: state.fieldErrors.quantity_required }]
                    : []
                }
              />
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

function IssueDialog({
  eventId,
  requirementId,
  warehouses,
  remaining,
}: {
  eventId: string;
  requirementId: string;
  warehouses: Warehouse[];
  remaining: string;
}) {
  const [open, setOpen] = useState(false);
  const action = issueInventoryRequirement.bind(null, eventId, requirementId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue stock for this requirement</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.warehouse_id}>
              <FieldLabel htmlFor="warehouse_id">From warehouse</FieldLabel>
              <Select name="warehouse_id" required>
                <SelectTrigger id="warehouse_id">
                  <SelectValue placeholder="Choose a warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.quantity}>
              <FieldLabel htmlFor="quantity">
                Quantity ({remaining} remaining)
              </FieldLabel>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.001"
                min="0"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.quantity
                    ? [{ message: state.fieldErrors.quantity }]
                    : []
                }
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Issuing…' : 'Issue'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryTab({
  eventId,
  requirements,
  items,
  warehouses,
  canManage,
  canIssue,
}: {
  eventId: string;
  requirements: EventInventoryRequirement[];
  items: Item[];
  warehouses: Warehouse[];
  canManage: boolean;
  canIssue: boolean;
}) {
  const columns = useMemo<ColumnDef<EventInventoryRequirement, unknown>[]>(
    () => [
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row) => row.inventory_item?.name ?? row.inventory_item_id,
      },
      { accessorKey: 'quantity_required', header: 'Required' },
      { accessorKey: 'quantity_issued', header: 'Issued' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const remaining = (
            Number(row.original.quantity_required) -
            Number(row.original.quantity_issued)
          ).toFixed(3);
          return (
            <div className="flex justify-end gap-2">
              {canIssue && Number(remaining) > 0 && (
                <IssueDialog
                  eventId={eventId}
                  requirementId={row.original.id}
                  warehouses={warehouses}
                  remaining={remaining}
                />
              )}
              {canManage && (
                <DeleteButton
                  itemLabel={
                    row.original.inventory_item?.name ?? 'this requirement'
                  }
                  onDelete={() =>
                    removeInventoryRequirement(eventId, row.original.id)
                  }
                />
              )}
            </div>
          );
        },
      },
    ],
    [canIssue, canManage, eventId, warehouses],
  );

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <AddRequirementDialog eventId={eventId} items={items} />
        </div>
      )}
      <DataTable
        columns={columns}
        data={requirements}
        emptyTitle="No inventory requirements set for this event"
      />
    </div>
  );
}
