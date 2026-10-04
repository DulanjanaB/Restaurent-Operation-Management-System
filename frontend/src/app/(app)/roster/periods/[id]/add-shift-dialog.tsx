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
import { createShift } from '@/lib/server/roster/actions';
import type { Department, ShiftTemplate } from '@/lib/server/roster/types';

export function AddShiftDialog({
  rosterPeriodId,
  shiftTemplates,
  departments,
}: {
  rosterPeriodId: string;
  shiftTemplates: ShiftTemplate[];
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>('none');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function handleTemplateChange(value: string) {
    setTemplateId(value);
    const template = shiftTemplates.find((t) => t.id === value);
    if (template) {
      setStartTime(template.start_time.slice(0, 5));
      setEndTime(template.end_time.slice(0, 5));
    }
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createShift(rosterPeriodId, {
        shift_template_id: templateId !== 'none' ? templateId : undefined,
        date: String(formData.get('date')),
        start_time: String(formData.get('start_time')),
        end_time: String(formData.get('end_time')),
        department_id: String(formData.get('department_id') || '') || undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTemplateId('none');
        setStartTime('');
        setEndTime('');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add shift</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a shift</DialogTitle>
        </DialogHeader>
        <form action={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input id="date" name="date" type="date" required />
            </Field>
            <Field>
              <FieldLabel>Shift template</FieldLabel>
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="None (custom time)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (custom time)</SelectItem>
                  {shiftTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="start_time">Start time</FieldLabel>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_time">End time</FieldLabel>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="department_id">Department</FieldLabel>
              <Select name="department_id">
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
              {pending ? 'Adding…' : 'Add shift'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
