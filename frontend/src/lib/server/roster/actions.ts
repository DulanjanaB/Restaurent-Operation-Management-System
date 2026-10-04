'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type {
  AttendanceStatus,
  Employee,
  EmployeeDocument,
  LeaveType,
  RosterPeriod,
  RosterPeriodType,
  ShiftAssignmentStatus,
} from './types';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// Same generation scheme as the backend's own POST /users/:id/reset-password
// auto-generate path (randomBytes(9).toString('base64url')) — kept
// consistent since both ultimately hand an admin a one-time password to
// relay to someone else.
function generatePassword(): string {
  return randomBytes(9).toString('base64url');
}

// --- Departments ---

export async function createDepartment(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/departments', {
      method: 'POST',
      body: JSON.stringify({ branch_id: branchId, name: formData.get('name') }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/departments');
  return {};
}

export async function updateDepartment(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: formData.get('name') }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/departments');
  return {};
}

export async function deleteDepartment(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/departments/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/departments');
  return {};
}

// --- Positions ---

export async function createPosition(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/positions', {
      method: 'POST',
      body: JSON.stringify({ name: formData.get('name') }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/positions');
  return {};
}

export async function updatePosition(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/positions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: formData.get('name') }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/positions');
  return {};
}

export async function deletePosition(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/positions/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/positions');
  return {};
}

// --- Employees ---

export type CreateEmployeeResult = ActionResult & {
  employeeId?: string;
  generatedPassword?: string;
  warning?: string;
};

// Every employee is a system user, so the account is always created first
// and linked to the employee record. Requires administration.user.create as
// well as roster.create (the dialog is hidden otherwise). If the employee
// POST fails after the user was created, the user is rolled back rather
// than left orphaned.
export async function createEmployee(
  branchId: string,
  _prev: CreateEmployeeResult,
  formData: FormData,
): Promise<CreateEmployeeResult> {
  const password = generatePassword();
  const username = String(formData.get('username') ?? '');
  const email = String(formData.get('email') ?? '');
  let userId: string;
  let createdUser = false;
  try {
    const user = await apiFetch<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        phone: str(formData, 'phone'),
        name: formData.get('name'),
        password,
        primary_branch_id: branchId,
      }),
    });
    userId = user.id;
    createdUser = true;
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) {
      return describeApiError(error);
    }
    // The login already exists (created earlier, or for another person with
    // the same email). Link to it rather than failing — but only if it's the
    // same account, matched by email or username.
    const users = await apiFetch<
      { id: string; username: string; email: string }[]
    >('/users').catch(() => null);
    const existing = users?.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() ||
        user.username.toLowerCase() === username.toLowerCase(),
    );
    if (!existing) {
      return describeApiError(error);
    }
    userId = existing.id;
  }
  const generatedPassword = createdUser ? password : undefined;

  let employeeId: string;
  try {
    const employee = await apiFetch<Employee>('/roster/employees', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        employee_code: formData.get('employee_code'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: str(formData, 'email'),
        position_id: formData.get('position_id'),
        department_id: formData.get('department_id'),
        hire_date: formData.get('hire_date'),
        user_id: userId,
      }),
    });
    employeeId = employee.id;
  } catch (error) {
    if (createdUser) {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    }
    return describeApiError(error);
  }

  const failedRoles: string[] = [];
  for (const roleId of formData.getAll('role_id').map(String)) {
    try {
      await apiFetch(`/users/${userId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role_id: roleId, branch_id: branchId }),
      });
    } catch {
      failedRoles.push(roleId);
    }
  }

  revalidatePath('/roster/employees');
  const warning =
    failedRoles.length > 0
      ? `Employee created, but ${failedRoles.length} role(s) could not be assigned. Add them from Administration → Users.`
      : undefined;
  return { employeeId, generatedPassword, warning };
}

// Inline add from the New person form, so a position or department that
// doesn't exist yet never blocks creating the employee.
export async function quickCreatePosition(
  name: string,
): Promise<ActionResult & { id?: string; name?: string }> {
  try {
    const position = await apiFetch<{ id: string; name: string }>(
      '/roster/positions',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
    );
    revalidatePath('/roster/positions');
    return { id: position.id, name: position.name };
  } catch (error) {
    return describeApiError(error);
  }
}

export async function quickCreateDepartment(
  branchId: string,
  name: string,
): Promise<ActionResult & { id?: string; name?: string }> {
  try {
    const department = await apiFetch<{ id: string; name: string }>(
      '/roster/departments',
      {
        method: 'POST',
        body: JSON.stringify({ branch_id: branchId, name }),
      },
    );
    revalidatePath('/roster/departments');
    return { id: department.id, name: department.name };
  } catch (error) {
    return describeApiError(error);
  }
}

// Backfills a login for an employee created before this was mandatory, or
// one whose login creation was skipped (lacked administration.user.create
// at the time). Username defaults to the employee code; email falls back
// to a placeholder only when the employee record itself has none, since
// User.email is required but Employee.email is optional.
export async function createLoginForEmployee(
  employeeId: string,
  name: string,
  username: string,
  email: string,
): Promise<ActionResult & { generatedPassword?: string }> {
  const password = generatePassword();
  let userId: string;
  try {
    const user = await apiFetch<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({ username, email, name, password }),
    });
    userId = user.id;
  } catch (error) {
    return describeApiError(error);
  }
  try {
    await apiFetch(`/roster/employees/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId }),
    });
  } catch (error) {
    await apiFetch(`/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    return describeApiError(error);
  }
  revalidatePath(`/roster/employees/${employeeId}`);
  revalidatePath('/roster/employees');
  return { generatedPassword: password };
}

export interface BulkLoginCreated {
  employeeName: string;
  username: string;
  password: string;
}

export interface BulkLoginResult {
  created: BulkLoginCreated[];
  failed: number;
  error?: string;
}

// One-time catch-up action for every employee in the branch still missing
// a login — surfaced on the Employees list page. Each creation is
// independent (Promise.allSettled); one failure doesn't block the rest.
// Unlike the single-employee flow, there's no toast that can hold
// potentially dozens of generated passwords — the caller is expected to
// show `created` in a dialog the admin can read from/copy before closing,
// since each password is shown exactly this once.
export async function bulkCreateLogins(
  branchId: string,
): Promise<BulkLoginResult> {
  let employees: Employee[];
  try {
    employees = await apiFetch<Employee[]>(
      `/roster/employees?branch_id=${branchId}`,
    );
  } catch (error) {
    if (error instanceof ApiError)
      return { created: [], failed: 0, error: 'Could not load employees.' };
    throw error;
  }

  const missing = employees.filter((employee) => !employee.user_id);
  const results = await Promise.allSettled(
    missing.map(async (employee) => {
      const username = employee.employee_code.toLowerCase();
      const email = employee.email ?? `${username}@employee.local`;
      const result = await createLoginForEmployee(
        employee.id,
        employee.name,
        username,
        email,
      );
      if (result.error || result.fieldErrors || !result.generatedPassword) {
        throw new Error(result.error ?? 'failed');
      }
      const created: BulkLoginCreated = {
        employeeName: employee.name,
        username,
        password: result.generatedPassword,
      };
      return created;
    }),
  );

  const created = results
    .filter(
      (result): result is PromiseFulfilledResult<BulkLoginCreated> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value);
  const failed = results.length - created.length;
  revalidatePath('/roster/employees');
  return { created, failed };
}

export async function updateEmployee(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: str(formData, 'email'),
        position_id: formData.get('position_id'),
        department_id: formData.get('department_id'),
        status: formData.get('status'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/employees/${id}`);
  revalidatePath('/roster/employees');
  return {};
}

// --- Shift Templates ---

export async function createShiftTemplate(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/shift-templates', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/shift-templates');
  return {};
}

export async function updateShiftTemplate(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shift-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/shift-templates');
  return {};
}

export async function deleteShiftTemplate(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shift-templates/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/shift-templates');
  return {};
}

// --- Roster Periods ---

export async function createRosterPeriod(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let periodId: string;
  try {
    const period = await apiFetch<RosterPeriod>('/roster/periods', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        period_type: formData.get('period_type') as RosterPeriodType,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
      }),
    });
    periodId = period.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/periods');
  redirect(`/roster/periods/${periodId}`);
}

export async function publishRosterPeriod(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/periods/${id}/publish`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${id}`);
  revalidatePath('/roster/periods');
  return {};
}

// Backend restricts both of these to draft periods (400 otherwise) — the
// frontend only shows the controls for a draft period in the first place,
// this is just the matching write path.
export async function updateRosterPeriod(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/periods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${id}`);
  revalidatePath('/roster/periods');
  return {};
}

export async function deleteRosterPeriod(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/periods/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/periods');
  return {};
}

// --- Shifts ---

export async function createShift(
  rosterPeriodId: string,
  fields: {
    shift_template_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    department_id?: string;
  },
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/shifts', {
      method: 'POST',
      body: JSON.stringify({ roster_period_id: rosterPeriodId, ...fields }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

export async function updateShift(
  rosterPeriodId: string,
  shiftId: string,
  fields: {
    date?: string;
    start_time?: string;
    end_time?: string;
    department_id?: string;
  },
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shifts/${shiftId}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

export async function deleteShift(
  rosterPeriodId: string,
  shiftId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shifts/${shiftId}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

// --- Shift Assignments ---

export async function createShiftAssignment(
  rosterPeriodId: string,
  shiftId: string,
  employeeId: string,
  positionId: string,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/shift-assignments', {
      method: 'POST',
      body: JSON.stringify({
        shift_id: shiftId,
        employee_id: employeeId,
        position_id: positionId,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

export async function updateShiftAssignmentStatus(
  rosterPeriodId: string,
  assignmentId: string,
  status: ShiftAssignmentStatus,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shift-assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

export async function updateShiftAssignmentPosition(
  rosterPeriodId: string,
  assignmentId: string,
  positionId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shift-assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ position_id: positionId }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

export async function removeShiftAssignment(
  rosterPeriodId: string,
  assignmentId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/shift-assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/periods/${rosterPeriodId}`);
  return {};
}

// --- Attendance ---

export async function markAttendance(fields: {
  employee_id: string;
  date: string;
  status: AttendanceStatus;
  shift_assignment_id?: string;
}): Promise<ActionResult> {
  try {
    await apiFetch('/roster/attendance', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/attendance');
  return {};
}

export async function updateAttendanceStatus(
  id: string,
  status: AttendanceStatus,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/attendance');
  return {};
}

// Attendance rows aren't pre-created — the fast inline-edit grid needs to
// create-or-update depending on whether today's row already exists for
// this employee. existingId is null the first time a given employee/date
// is marked.
export async function deleteAttendance(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/attendance/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/attendance');
  return {};
}

export async function setAttendanceStatus(
  employeeId: string,
  date: string,
  existingId: string | null,
  status: AttendanceStatus,
): Promise<ActionResult> {
  if (existingId) {
    return updateAttendanceStatus(existingId, status);
  }
  return markAttendance({ employee_id: employeeId, date, status });
}

// --- Leave ---

// Leave requests are NOT self-service in this backend by design (only
// Employee Documents got that exception per docs/roster-management-design.md)
// — creating one needs roster.create, same as any other roster record, so
// the caller picks which employee it's for rather than it being implicitly
// "me."
export async function createLeaveRequest(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/leave', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: formData.get('employee_id'),
        leave_type: formData.get('leave_type') as LeaveType,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        reason: str(formData, 'reason'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/leave');
  return {};
}

export async function decideLeaveRequest(
  id: string,
  decision: 'approve' | 'reject',
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/leave/${id}/${decision}`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/leave/approvals');
  return {};
}

export async function deleteLeaveRequest(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/leave/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/leave');
  return {};
}

// --- Document Types ---

export async function createDocumentType(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/roster/document-types', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        requires_expiry: formData.get('requires_expiry') === 'on',
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/document-types');
  return {};
}

export async function updateDocumentType(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/document-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        requires_expiry: formData.get('requires_expiry') === 'on',
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/document-types');
  return {};
}

export async function deleteDocumentType(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/document-types/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/roster/document-types');
  return {};
}

// --- Employee Documents ---

export async function uploadEmployeeDocument(
  employeeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch<EmployeeDocument>('/roster/employee-documents', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employeeId,
        document_type_id: formData.get('document_type_id'),
        file_url: formData.get('file_url'),
        issue_date: str(formData, 'issue_date'),
        expiry_date: str(formData, 'expiry_date'),
        notes: str(formData, 'notes'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/employees/${employeeId}`);
  return {};
}

export async function deleteEmployeeDocument(
  employeeId: string,
  documentId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/roster/employee-documents/${documentId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/roster/employees/${employeeId}`);
  return {};
}
