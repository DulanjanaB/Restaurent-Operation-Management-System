'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
import { createShiftAssignment } from '@/lib/server/roster/actions';
import type { Employee, Position } from '@/lib/server/roster/types';

export function AssignEmployeeDialog({
  rosterPeriodId,
  shiftId,
  employees,
  positions,
}: {
  rosterPeriodId: string;
  shiftId: string;
  employees: Employee[];
  positions: Position[];
}) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submit() {
    if (!employeeId || !positionId) {
      setError('Choose both an employee and a position.');
      return;
    }
    startTransition(async () => {
      const result = await createShiftAssignment(
        rosterPeriodId,
        shiftId,
        employeeId,
        positionId,
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setEmployeeId('');
        setPositionId('');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign an employee</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Employee</FieldLabel>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Position for this shift</FieldLabel>
            <Select value={positionId} onValueChange={setPositionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Assigning…' : 'Assign'}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
