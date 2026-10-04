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
  assignStaff,
  removeStaffAssignment,
} from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type { EventStaffAssignment } from '@/lib/server/events/types';
import type { Employee } from '@/lib/server/roster/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

function AddStaffDialog({
  eventId,
  employees,
}: {
  eventId: string;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const action = assignStaff.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Assign staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign staff to this event</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.staff_id}>
              <FieldLabel htmlFor="staff_id">Employee</FieldLabel>
              <Select name="staff_id" required>
                <SelectTrigger id="staff_id">
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.role_in_event}>
              <FieldLabel htmlFor="role_in_event">
                Role for this event
              </FieldLabel>
              <Input
                id="role_in_event"
                name="role_in_event"
                placeholder="e.g. Head Waiter"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.role_in_event
                    ? [{ message: state.fieldErrors.role_in_event }]
                    : []
                }
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Assigning…' : 'Assign'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffTab({
  eventId,
  assignments,
  employees,
  canManage,
  canViewEmployees,
}: {
  eventId: string;
  assignments: EventStaffAssignment[];
  employees: Employee[];
  canManage: boolean;
  canViewEmployees: boolean;
}) {
  const columns = useMemo<ColumnDef<EventStaffAssignment, unknown>[]>(
    () => [
      {
        id: 'staff',
        header: 'Employee',
        accessorFn: (row) => row.staff?.name ?? row.staff_id,
      },
      { accessorKey: 'role_in_event', header: 'Role' },
      ...(canManage
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: EventStaffAssignment } }) => (
                <div className="flex justify-end">
                  <DeleteButton
                    itemLabel={row.original.staff?.name ?? 'this assignment'}
                    onDelete={() =>
                      removeStaffAssignment(eventId, row.original.id)
                    }
                  />
                </div>
              ),
            } satisfies ColumnDef<EventStaffAssignment, unknown>,
          ]
        : []),
    ],
    [canManage, eventId],
  );

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          {canViewEmployees ? (
            <AddStaffDialog eventId={eventId} employees={employees} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Assigning staff requires roster view access to pick an employee.
            </p>
          )}
        </div>
      )}
      <DataTable
        columns={columns}
        data={assignments}
        emptyTitle="No staff assigned to this event yet"
      />
    </div>
  );
}
