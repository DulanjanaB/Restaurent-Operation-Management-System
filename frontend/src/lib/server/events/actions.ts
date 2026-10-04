'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import type { Event } from './types';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// --- Event Types ---

export async function createEventType(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/events/types', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/types');
  return {};
}

export async function updateEventType(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/types');
  return {};
}

export async function deleteEventType(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/events/types/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/types');
  return {};
}

// --- Customers ---

export async function createCustomer(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/events/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: str(formData, 'email'),
        address: str(formData, 'address'),
        notes: str(formData, 'notes'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/customers');
  return {};
}

export async function updateCustomer(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: str(formData, 'email'),
        address: str(formData, 'address'),
        notes: str(formData, 'notes'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/customers');
  return {};
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/events/customers/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/customers');
  return {};
}

// --- Venues (branch-scoped) ---

export async function createVenue(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/events/venues', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        capacity: formData.get('capacity'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/venues');
  return {};
}

export async function updateVenue(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/venues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        capacity: formData.get('capacity'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/venues');
  return {};
}

export async function deleteVenue(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/events/venues/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/venues');
  return {};
}

// --- Packages (branch-scoped) ---

export async function createPackage(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch('/events/packages', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        name: formData.get('name'),
        price_per_guest: str(formData, 'price_per_guest'),
        flat_price: str(formData, 'flat_price'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/packages');
  return {};
}

export async function updatePackage(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        price_per_guest: str(formData, 'price_per_guest'),
        flat_price: str(formData, 'flat_price'),
        description: str(formData, 'description'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/packages');
  return {};
}

export async function deletePackage(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/events/packages/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events/packages');
  return {};
}

// --- Events ---

export async function createEvent(
  branchId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let eventId: string;
  try {
    const event = await apiFetch<Event>('/events', {
      method: 'POST',
      body: JSON.stringify({
        branch_id: branchId,
        event_type_id: formData.get('event_type_id'),
        customer_id: formData.get('customer_id'),
        venue_id: formData.get('venue_id'),
        package_id: str(formData, 'package_id'),
        event_date: formData.get('event_date'),
        guest_count: formData.get('guest_count'),
      }),
    });
    eventId = event.id;
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events');
  redirect(`/events/${eventId}`);
}

export async function updateEvent(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  // The edit form's Package select has an explicit "no package" option
  // (value "none") so an existing package can be cleared — map that back
  // to null rather than sending the literal string "none" as a UUID.
  const packageId = str(formData, 'package_id');
  try {
    await apiFetch(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        event_type_id: formData.get('event_type_id'),
        customer_id: formData.get('customer_id'),
        venue_id: formData.get('venue_id'),
        package_id: packageId === 'none' ? null : packageId,
        event_date: formData.get('event_date'),
        guest_count: formData.get('guest_count'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${id}`);
  revalidatePath('/events');
  return {};
}

export async function setRevenueOverride(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        revenue_override: str(formData, 'revenue_override') ?? null,
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${id}`);
  return {};
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${id}`, { method: 'DELETE' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/events');
  return {};
}

export async function transitionEvent(
  id: string,
  transition: 'approve' | 'complete' | 'close' | 'cancel',
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${id}/${transition}`, { method: 'POST' });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${id}`);
  revalidatePath('/events');
  return {};
}

// --- Staff assignments ---

export async function assignStaff(
  eventId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${eventId}/staff`, {
      method: 'POST',
      body: JSON.stringify({
        staff_id: formData.get('staff_id'),
        role_in_event: formData.get('role_in_event'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function removeStaffAssignment(
  eventId: string,
  assignmentId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${eventId}/staff/${assignmentId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

// --- Expenses ---

export async function addExpense(
  eventId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        category: formData.get('category'),
        amount: formData.get('amount'),
        description: str(formData, 'description'),
        incurred_at: formData.get('incurred_at'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function removeExpense(
  eventId: string,
  expenseId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

// --- Inventory requirements ---

export async function addInventoryRequirement(
  eventId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(`/events/${eventId}/inventory-requirements`, {
      method: 'POST',
      body: JSON.stringify({
        inventory_item_id: formData.get('inventory_item_id'),
        quantity_required: formData.get('quantity_required'),
      }),
    });
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function removeInventoryRequirement(
  eventId: string,
  requirementId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(
      `/events/${eventId}/inventory-requirements/${requirementId}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}

// Deliberately gated on inventory.stock_out server-side, not an event.*
// permission — see event-inventory-requirements.controller.ts.
export async function issueInventoryRequirement(
  eventId: string,
  requirementId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiFetch(
      `/events/${eventId}/inventory-requirements/${requirementId}/issue`,
      {
        method: 'POST',
        body: JSON.stringify({
          warehouse_id: formData.get('warehouse_id'),
          quantity: formData.get('quantity'),
        }),
      },
    );
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath(`/events/${eventId}`);
  return {};
}
