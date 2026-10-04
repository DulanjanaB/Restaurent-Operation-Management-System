'use client';

import { useState, useTransition } from 'react';
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
import { updateShift } from '@/lib/server/roster/actions';
import type { Department, Shift } from '@/lib/server/roster/types';

export function EditShiftDialog({
  rosterPeriodId,
  shift,
  departments,
}: {
  rosterPeriodId: string;
  shift: Shift;
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submit(formData: FormData) {
    startTransition(async () => {
      const departmentId = String(formData.get('department_id') || '');
      const result = await updateShift(rosterPeriodId, shift.id, {
        date: String(formData.get('date')),
        start_time: String(formData.get('start_time')),
        end_time: String(formData.get('end_time')),
        department_id: departmentId || undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit shift</DialogTitle>
        </DialogHeader>
        <form action={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={shift.date}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="start_time">Start time</FieldLabel>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={shift.start_time.slice(0, 5)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_time">End time</FieldLabel>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={shift.end_time.slice(0, 5)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="department_id">Department</FieldLabel>
              <Select
                name="department_id"
                defaultValue={shift.department_id ?? undefined}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
