'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useActionSuccess } from '@/lib/hooks/use-action-success';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  createEmployee,
  quickCreateDepartment,
  quickCreatePosition,
  type CreateEmployeeResult,
} from '@/lib/server/roster/actions';
import type { Department, Position } from '@/lib/server/roster/types';
import type { Role } from '@/lib/server/administration/types';

const initialState: CreateEmployeeResult = {};

type QuickCreate = (
  name: string,
) => Promise<{ id?: string; name?: string; error?: string }>;

// Lets the user add a position or department on the spot, so the form is
// never stuck waiting for an admin to create master data first.
function InlineAdd({
  label,
  onCreate,
}: {
  label: string;
  onCreate: QuickCreate;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await onCreate(name.trim());
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="size-3" />
        Add new {label.toLowerCase()}
      </button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-md border border-dashed p-2">
      <div className="flex gap-2">
        <Input
          value={name}
          placeholder={`New ${label.toLowerCase()} name`}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={saving || !name.trim()}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function EmployeeCreateDialog({
  branchId,
  positions,
  departments,
  roles,
  canCreateLogin,
  canAssignRoles,
}: {
  branchId: string;
  positions: Position[];
  departments: Department[];
  roles: Role[];
  canCreateLogin: boolean;
  canAssignRoles: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [positionId, setPositionId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [addedPositions, setAddedPositions] = useState<Position[]>([]);
  const [addedDepartments, setAddedDepartments] = useState<Department[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const router = useRouter();
  const action = createEmployee.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);

  // System roles are never offered here — giving System Owner is not a
  // side-effect of creating a staff member.
  const assignableRoles = roles.filter((role) => !role.is_system_role);
  const positionOptions = [
    ...positions,
    ...addedPositions.filter(
      (added) => !positions.some((p) => p.id === added.id),
    ),
  ];
  const departmentOptions = [
    ...departments,
    ...addedDepartments.filter(
      (added) => !departments.some((d) => d.id === added.id),
    ),
  ];

  function handleEmployeeCodeChange(value: string) {
    setEmployeeCode(value);
    if (!usernameTouched) setUsername(value.toLowerCase());
  }

  function toggleRole(roleId: string, checked: boolean) {
    setRoleIds((current) =>
      checked ? [...current, roleId] : current.filter((id) => id !== roleId),
    );
  }

  const createPosition: QuickCreate = async (name) => {
    const result = await quickCreatePosition(name);
    if (result.id && result.name) {
      const created = { id: result.id, name: result.name } as Position;
      setAddedPositions((current) => [...current, created]);
      setPositionId(result.id);
    }
    return result;
  };

  const createDepartment: QuickCreate = async (name) => {
    const result = await quickCreateDepartment(branchId, name);
    if (result.id && result.name) {
      const created = {
        id: result.id,
        name: result.name,
        branch_id: branchId,
      } as Department;
      setAddedDepartments((current) => [...current, created]);
      setDepartmentId(result.id);
    }
    return result;
  };

  useActionSuccess(pending, state, (result) => {
    if (!result.employeeId) return;
    if (result.warning) {
      toast.warning(result.warning);
    }
    if (result.generatedPassword) {
      toast.success('Person created with a login', {
        description: `Temporary password: ${result.generatedPassword}`,
        duration: 30000,
      });
    } else {
      toast.success('Person created.');
    }
    setOpen(false);
    router.push(`/roster/employees/${result.employeeId}`);
  });

  const canSubmit =
    canCreateLogin && !!positionId && !!departmentId && !pending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New person</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New person</DialogTitle>
          <DialogDescription>
            Creates the employee record, their login, and their roles in one
            step.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" name="name" required />
              <FieldError
                errors={
                  state.fieldErrors?.name
                    ? [{ message: state.fieldErrors.name }]
                    : []
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors?.employee_code}>
                <FieldLabel htmlFor="employee_code">Employee code</FieldLabel>
                <Input
                  id="employee_code"
                  name="employee_code"
                  required
                  value={employeeCode}
                  onChange={(event) =>
                    handleEmployeeCodeChange(event.target.value)
                  }
                />
                <FieldError
                  errors={
                    state.fieldErrors?.employee_code
                      ? [{ message: state.fieldErrors.employee_code }]
                      : []
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="hire_date">Hire date</FieldLabel>
                <Input id="hire_date" name="hire_date" type="date" required />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" name="phone" required />
              </Field>
              <Field data-invalid={!!state.fieldErrors?.email}>
                <FieldLabel htmlFor="email">Email (login)</FieldLabel>
                <Input id="email" name="email" type="email" required />
                <FieldError
                  errors={
                    state.fieldErrors?.email
                      ? [{ message: state.fieldErrors.email }]
                      : []
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="position_id">Position</FieldLabel>
                <Select value={positionId} onValueChange={setPositionId}>
                  <SelectTrigger id="position_id">
                    <SelectValue placeholder="Choose a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="position_id" value={positionId} />
                <InlineAdd label="Position" onCreate={createPosition} />
              </Field>
              <Field>
                <FieldLabel htmlFor="department_id">Department</FieldLabel>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department_id">
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="department_id"
                  value={departmentId}
                />
                <InlineAdd label="Department" onCreate={createDepartment} />
              </Field>
            </div>

            {canCreateLogin && (
              <Field data-invalid={!!state.fieldErrors?.username}>
                <FieldLabel htmlFor="username">Login username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(event) => {
                    setUsernameTouched(true);
                    setUsername(event.target.value);
                  }}
                />
                <FieldError
                  errors={
                    state.fieldErrors?.username
                      ? [{ message: state.fieldErrors.username }]
                      : []
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Every employee is a system user. A temporary password is
                  generated and shown once after creation.
                </p>
              </Field>
            )}

            {canAssignRoles && assignableRoles.length > 0 && (
              <Field>
                <FieldLabel>Roles for this branch</FieldLabel>
                <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                  {assignableRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={roleIds.includes(role.id)}
                        onCheckedChange={(checked) =>
                          toggleRole(role.id, checked === true)
                        }
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
                {roleIds.map((roleId) => (
                  <input
                    key={roleId}
                    type="hidden"
                    name="role_id"
                    value={roleId}
                  />
                ))}
              </Field>
            )}

            {!canCreateLogin && (
              <p className="text-xs text-destructive">
                Adding a person also creates their system login, so you need
                user-creation permission (administration.user.create) to do it.
              </p>
            )}
            {(!positionId || !departmentId) && (
              <p className="text-xs text-muted-foreground">
                Choose a position and a department (or add a new one) to
                continue.
              </p>
            )}

            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={!canSubmit}>
              {pending ? 'Creating…' : 'Create person'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
