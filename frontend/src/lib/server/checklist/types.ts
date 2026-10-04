import type { Employee } from '@/lib/server/roster/types';

// branch/creator relations are declared on the backend entity but never
// populated by any endpoint — only branch_id/created_by are ever returned.
export interface ChecklistTemplate {
  id: string;
  branch_id: string;
  name: string;
  area: string | null;
  description: string | null;
  is_active: boolean;
  created_by: string;
}

export interface ChecklistItem {
  id: string;
  checklist_template_id: string;
  sequence: number;
  label: string;
  requires_reason_on_no: boolean;
}

// checklist_template/employee populated on GET list ONLY — undefined on
// create/deactivate responses. assigner is never populated by any endpoint.
export interface ChecklistAssignment {
  id: string;
  checklist_template_id: string;
  checklist_template?: ChecklistTemplate;
  employee_id: string;
  employee?: Employee;
  assigned_by: string;
  active: boolean;
  start_date: string;
  end_date: string | null;
}

export type ChecklistRecordStatus = 'pending' | 'completed';

// checklist_template/employee populated on list (/records, /records/my)
// ONLY — GET /records/:id returns NEITHER (only the hand-attached
// responses/items, see ChecklistRecordDetail below).
export interface ChecklistRecord {
  id: string;
  checklist_assignment_id: string;
  checklist_template_id: string;
  checklist_template?: ChecklistTemplate;
  employee_id: string;
  employee?: Employee;
  branch_id: string;
  date: string;
  status: ChecklistRecordStatus;
  completed_at: string | null;
  completed_by: string | null;
}

// checklist_item populated here; answerer is never populated by any
// endpoint.
export interface ChecklistRecordResponse {
  id: string;
  checklist_record_id: string;
  checklist_item_id: string;
  checklist_item?: ChecklistItem;
  answer: boolean;
  reason: string | null;
  answered_by: string;
  answered_at: string;
}

// GET /checklist/records/:id's exact shape — the record's own relations
// (checklist_template/employee) are NOT populated here, only these two
// hand-attached arrays.
export interface ChecklistRecordDetail extends ChecklistRecord {
  responses: ChecklistRecordResponse[];
  items: ChecklistItem[];
}
