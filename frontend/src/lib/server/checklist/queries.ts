import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  ChecklistAssignment,
  ChecklistItem,
  ChecklistRecord,
  ChecklistRecordDetail,
  ChecklistRecordStatus,
  ChecklistTemplate,
} from './types';

export function getChecklistTemplates(
  branchId?: string,
): Promise<ChecklistTemplate[]> {
  return apiFetch<ChecklistTemplate[]>(
    `/checklist/templates${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getChecklistTemplate(
  id: string,
): Promise<ChecklistTemplate & { items: ChecklistItem[] }> {
  return apiFetch(`/checklist/templates/${id}`);
}

export function getChecklistAssignments(filters: {
  employeeId?: string;
  templateId?: string;
}): Promise<ChecklistAssignment[]> {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employee_id', filters.employeeId);
  if (filters.templateId) params.set('template_id', filters.templateId);
  const query = params.toString();
  return apiFetch<ChecklistAssignment[]>(
    `/checklist/assignments${query ? `?${query}` : ''}`,
  );
}

export function getMyChecklistRecords(filters: {
  status?: ChecklistRecordStatus;
  date?: string;
}): Promise<ChecklistRecord[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.date) params.set('date', filters.date);
  const query = params.toString();
  return apiFetch<ChecklistRecord[]>(
    `/checklist/records/my${query ? `?${query}` : ''}`,
  );
}

export function getChecklistRecords(filters: {
  employeeId?: string;
  status?: ChecklistRecordStatus;
  date?: string;
}): Promise<ChecklistRecord[]> {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employee_id', filters.employeeId);
  if (filters.status) params.set('status', filters.status);
  if (filters.date) params.set('date', filters.date);
  const query = params.toString();
  return apiFetch<ChecklistRecord[]>(
    `/checklist/records${query ? `?${query}` : ''}`,
  );
}

export function getChecklistRecord(id: string): Promise<ChecklistRecordDetail> {
  return apiFetch<ChecklistRecordDetail>(`/checklist/records/${id}`);
}
