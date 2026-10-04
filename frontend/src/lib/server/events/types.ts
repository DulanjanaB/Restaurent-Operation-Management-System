import type { Employee } from '@/lib/server/roster/types';
import type { Item } from '@/lib/server/inventory/types';

export type EventStatus =
  'requested' | 'confirmed' | 'completed' | 'closed' | 'cancelled';

export interface EventType {
  id: string;
  name: string;
  description: string | null;
}

// Global, not branch-scoped — a customer may book events at different
// branches. No search/filter endpoint exists on the backend.
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
}

export interface Venue {
  id: string;
  branch_id: string;
  name: string;
  capacity: number;
  description: string | null;
}

// Backend table is `event_packages`, class name `Package`.
export interface EventPackage {
  id: string;
  branch_id: string;
  name: string;
  price_per_guest: string | null;
  flat_price: string | null;
  description: string | null;
}

// GET list/one populate event_type/customer/venue/package. EVERY mutating
// endpoint (create/update/approve/complete/close/cancel) returns ONLY the
// bare FK columns — all relation fields are undefined on those responses.
// Callers that need populated relations after a mutation should re-fetch
// via getEvent(id) (which revalidatePath already triggers a re-render for).
export interface Event {
  id: string;
  branch_id: string;
  event_type_id: string;
  event_type?: EventType;
  customer_id: string;
  customer?: Customer;
  venue_id: string;
  venue?: Venue;
  package_id: string | null;
  package?: EventPackage | null;
  event_date: string;
  guest_count: number;
  status: EventStatus;
  revenue_override: string | null;
  created_by: string;
}

export interface EventStaffAssignment {
  id: string;
  event_id: string;
  staff_id: string;
  // Populated on GET list, NOT on the create (POST) response.
  staff?: Employee;
  role_in_event: string;
}

export interface EventExpense {
  id: string;
  event_id: string;
  category: string;
  amount: string;
  description: string | null;
  incurred_at: string;
}

export interface EventInventoryRequirement {
  id: string;
  event_id: string;
  inventory_item_id: string;
  // Populated on GET list only — undefined on create/issue responses.
  inventory_item?: Item;
  quantity_required: string;
  quantity_issued: string;
}

// Computed on every call, never stored — see events.service.ts#getFinancials.
// revenue_override on Event always wins over package pricing when non-null.
export interface EventFinancials {
  cost: string;
  revenue: string;
  profit: string;
}
