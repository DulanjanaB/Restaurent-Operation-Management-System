'use client';

import { useActionState, useState } from 'react';
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
import { createChecklistAssignment } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import type { ChecklistTemplate } from '@/lib/server/checklist/types';
import type { Employee } from '@/lib/server/roster/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AssignmentCreateDialog({
  templates,
  employees,
}: {
  templates: ChecklistTemplate[];
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createChecklistAssignment,
    initialState,
  );
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Assignment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a checklist</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.checklist_template_id}>
              <FieldLabel htmlFor="checklist_template_id">Template</FieldLabel>
              <Select name="checklist_template_id" required>
                <SelectTrigger id="checklist_template_id">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.employee_id}>
              <FieldLabel htmlFor="employee_id">Employee</FieldLabel>
              <Select name="employee_id" required>
                <SelectTrigger id="employee_id">
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
            <Field data-invalid={!!state.fieldErrors?.start_date}>
              <FieldLabel htmlFor="start_date">Start date</FieldLabel>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={today()}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_date">End date (optional)</FieldLabel>
              <Input id="end_date" name="end_date" type="date" />
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
