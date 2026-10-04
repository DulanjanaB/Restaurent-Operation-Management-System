'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { updateEmployee } from '@/lib/server/roster/actions';
import type { ActionResult } from '@/lib/validation';
import type { Department, Employee, Position } from '@/lib/server/roster/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function ProfileTab({
  employee,
  positions,
  departments,
  canUpdate,
}: {
  employee: Employee;
  positions: Position[];
  departments: Department[];
  canUpdate: boolean;
}) {
  const action = updateEmployee.bind(null, employee.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Profile saved.');

  return (
    <form action={formAction} className="max-w-md">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={employee.name}
            disabled={!canUpdate}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            name="phone"
            defaultValue={employee.phone}
            disabled={!canUpdate}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={employee.email ?? ''}
            disabled={!canUpdate}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="position_id">Position</FieldLabel>
          <Select
            name="position_id"
            defaultValue={employee.position_id}
            disabled={!canUpdate}
          >
            <SelectTrigger id="position_id">
              <SelectValue />
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
        <Field>
          <FieldLabel htmlFor="department_id">Department</FieldLabel>
          <Select
            name="department_id"
            defaultValue={employee.department_id}
            disabled={!canUpdate}
          >
            <SelectTrigger id="department_id">
              <SelectValue />
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
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            name="status"
            defaultValue={employee.status}
            disabled={!canUpdate}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        {canUpdate && (
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
        )}
      </FieldGroup>
    </form>
  );
}
