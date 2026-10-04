'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { ChecklistTemplate } from './types';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// --- Templates ---

// The bulk create builder defaults every item to requires_reason_on_no:
// true (the backend's own default) — fine-grained per-item toggling
// happens afterward via updateChecklistItem on the template detail page.
export async function createChecklistTemplate(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const labels = formData
    .getAll('item_label')
    .map(String)
    .filter((label) => label.length > 0);
  const items = labels.map((label, index) => ({
    sequence: index + 1,
    label,
    requires_reason_on_no: true,
  }));

  let templateId: string;
  try {
    const template = await apiFetch<ChecklistTemplate>('/checklist/templates', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        area: str(formData, 'area'),
        description: str(formData, 'description'),
        items,
      }),
    });
    templateId = template.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/checklist/templates');
  redirect(`/checklist/templates/${templateId}`);
}

export async function updateChecklistTemplate(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        area: str(formData, 'area'),
        description: str(formData, 'description'),
        is_active: formData.get('is_active') === 'on',
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/checklist/templates/${id}`);
  revalidatePath('/checklist/templates');
  return {};
}

export async function deleteChecklistTemplate(
  id: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/templates/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/checklist/templates');
  return {};
}

// --- Template items ---

export async function addChecklistItem(
  templateId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/templates/${templateId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        sequence: formData.get('sequence'),
        label: formData.get('label'),
        requires_reason_on_no: formData.get('requires_reason_on_no') === 'on',
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/checklist/templates/${templateId}`);
  return {};
}

export async function updateChecklistItem(
  templateId: string,
  itemId: string,
  patch: { sequence?: number; label?: string; requires_reason_on_no?: boolean },
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/templates/${templateId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/checklist/templates/${templateId}`);
  return {};
}

export async function removeChecklistItem(
  templateId: string,
  itemId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/templates/${templateId}/items/${itemId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/checklist/templates/${templateId}`);
  return {};
}

// --- Assignments ---

export async function createChecklistAssignment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/checklist/assignments', {
      method: 'POST',
      body: JSON.stringify({
        checklist_template_id: formData.get('checklist_template_id'),
        employee_id: formData.get('employee_id'),
        start_date: formData.get('start_date'),
        end_date: str(formData, 'end_date'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/checklist/assignments');
  return {};
}

export async function deactivateChecklistAssignment(
  id: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/assignments/${id}/deactivate`, {
      method: 'POST',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/checklist/assignments');
  return {};
}

// --- Records ---

export async function answerChecklistItem(
  recordId: string,
  itemId: string,
  answer: boolean,
  reason: string | undefined,
): Promise<ActionResult> {
  try {
    await apiFetch(`/checklist/records/${recordId}/items/${itemId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer, reason }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/checklist/records/${recordId}`);
  revalidatePath('/checklist/today');
  return {};
}
