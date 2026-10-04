import 'server-only';
import { apiFetch, ApiError } from '@/lib/api/client';
import type {
  Attendance,
  Department,
  DocumentType,
  Employee,
  EmployeeDocument,
  Leave,
  Position,
  RosterPeriod,
  Shift,
  ShiftAssignment,
  ShiftTemplate,
} from './types';

export function getDepartments(branchId?: string): Promise<Department[]> {
  return apiFetch<Department[]>(
    `/roster/departments${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getPositions(): Promise<Position[]> {
  return apiFetch<Position[]>('/roster/positions');
}

export function getEmployees(branchId?: string): Promise<Employee[]> {
  return apiFetch<Employee[]>(
    `/roster/employees${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getEmployee(id: string): Promise<Employee> {
  return apiFetch<Employee>(`/roster/employees/${id}`);
}

// Authenticated-only, no roster.view needed — the self-service Employee
// Documents flow needs a way to resolve "my own employee record" without
// the permission that GET /roster/employees/:id requires. Returns null
// (never throws) when the current user has no linked employee.
export async function getMyEmployee(): Promise<Employee | null> {
  try {
    return await apiFetch<Employee>('/roster/employees/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getShiftTemplates(branchId?: string): Promise<ShiftTemplate[]> {
  return apiFetch<ShiftTemplate[]>(
    `/roster/shift-templates${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getRosterPeriods(branchId?: string): Promise<RosterPeriod[]> {
  return apiFetch<RosterPeriod[]>(
    `/roster/periods${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getRosterPeriod(id: string): Promise<RosterPeriod> {
  return apiFetch<RosterPeriod>(`/roster/periods/${id}`);
}

export function getShifts(rosterPeriodId: string): Promise<Shift[]> {
  return apiFetch<Shift[]>(`/roster/shifts?roster_period_id=${rosterPeriodId}`);
}

export function getShiftAssignments(
  shiftId: string,
): Promise<ShiftAssignment[]> {
  return apiFetch<ShiftAssignment[]>(
    `/roster/shift-assignments?shift_id=${shiftId}`,
  );
}

export function getAttendance(filters: {
  employeeId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Attendance[]> {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employee_id', filters.employeeId);
  if (filters.date) params.set('date', filters.date);
  if (filters.dateFrom && filters.dateTo) {
    params.set('date_from', filters.dateFrom);
    params.set('date_to', filters.dateTo);
  }
  const query = params.toString();
  return apiFetch<Attendance[]>(
    `/roster/attendance${query ? `?${query}` : ''}`,
  );
}

export function getLeaveRequests(employeeId?: string): Promise<Leave[]> {
  return apiFetch<Leave[]>(
    `/roster/leave${employeeId ? `?employee_id=${employeeId}` : ''}`,
  );
}

export function getDocumentTypes(): Promise<DocumentType[]> {
  return apiFetch<DocumentType[]>('/roster/document-types');
}

export function getEmployeeDocuments(
  employeeId: string,
): Promise<EmployeeDocument[]> {
  return apiFetch<EmployeeDocument[]>(
    `/roster/employee-documents?employee_id=${employeeId}`,
  );
}
