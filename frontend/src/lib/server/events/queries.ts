import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type {
  Customer,
  Event,
  EventExpense,
  EventFinancials,
  EventInventoryRequirement,
  EventPackage,
  EventStaffAssignment,
  EventType,
  Venue,
} from './types';

export function getEventTypes(): Promise<EventType[]> {
  return apiFetch<EventType[]>('/events/types');
}

// No search/filter param exists on the backend — list is unfiltered.
export function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/events/customers');
}

export function getVenues(branchId?: string): Promise<Venue[]> {
  return apiFetch<Venue[]>(
    `/events/venues${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getPackages(branchId?: string): Promise<EventPackage[]> {
  return apiFetch<EventPackage[]>(
    `/events/packages${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getEvents(branchId?: string): Promise<Event[]> {
  return apiFetch<Event[]>(
    `/events${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/events/${id}`);
}

export function getEventFinancials(id: string): Promise<EventFinancials> {
  return apiFetch<EventFinancials>(`/events/${id}/financials`);
}

export function getEventStaff(
  eventId: string,
): Promise<EventStaffAssignment[]> {
  return apiFetch<EventStaffAssignment[]>(`/events/${eventId}/staff`);
}

export function getEventExpenses(eventId: string): Promise<EventExpense[]> {
  return apiFetch<EventExpense[]>(`/events/${eventId}/expenses`);
}

export function getEventInventoryRequirements(
  eventId: string,
): Promise<EventInventoryRequirement[]> {
  return apiFetch<EventInventoryRequirement[]>(
    `/events/${eventId}/inventory-requirements`,
  );
}
