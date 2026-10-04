export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type RosterPeriodType = 'weekly' | 'monthly';
export type RosterPeriodStatus = 'draft' | 'published';
export type ShiftAssignmentStatus =
  'assigned' | 'confirmed' | 'no_show' | 'completed';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Department {
  id: string;
  branch_id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

// position/department are only populated by GET /roster/employees(+/:id) —
// absent everywhere else (e.g. nested inside a ShiftAssignment). user is
// never populated; only user_id.
export interface Employee {
  id: string;
  branch_id: string;
  employee_code: string;
  name: string;
  phone: string;
  email: string | null;
  position_id: string;
  position?: Position;
  department_id: string;
  department?: Department;
  hire_date: string;
  status: EmployeeStatus;
  user_id: string | null;
}

export interface ShiftTemplate {
  id: string;
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface RosterPeriod {
  id: string;
  branch_id: string;
  period_type: RosterPeriodType;
  start_date: string;
  end_date: string;
  status: RosterPeriodStatus;
  published_at: string | null;
  published_by: string | null;
}

// department/shift_template only populated on GET; roster_period never is.
export interface Shift {
  id: string;
  roster_period_id: string;
  shift_template_id: string | null;
  shift_template?: ShiftTemplate;
  date: string;
  start_time: string;
  end_time: string;
  department_id: string | null;
  department?: Department;
}

// employee/position populated on GET; shift never is.
export interface ShiftAssignment {
  id: string;
  shift_id: string;
  employee_id: string;
  employee?: Employee;
  position_id: string;
  position?: Position;
  status: ShiftAssignmentStatus;
}

export interface Attendance {
  id: string;
  employee_id: string;
  shift_assignment_id: string | null;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: AttendanceStatus;
}

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveStatus;
  approved_by: string | null;
}

export interface DocumentType {
  id: string;
  name: string;
  requires_expiry: boolean;
}

// document_type populated on the list GET only, never on create.
export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type_id: string;
  document_type?: DocumentType;
  file_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  uploaded_by: string;
  uploaded_at: string;
  notes: string | null;
}

// Not returned by the backend — computed client-side from expiry_date,
// since neither the entity nor the service exposes this.
export type DocumentValidity =
  'valid' | 'expiring_soon' | 'expired' | 'no_expiry';

export function computeDocumentValidity(
  expiryDate: string | null,
  expiringSoonDays = 30,
): DocumentValidity {
  if (!expiryDate) return 'no_expiry';
  const days =
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= expiringSoonDays) return 'expiring_soon';
  return 'valid';
}
