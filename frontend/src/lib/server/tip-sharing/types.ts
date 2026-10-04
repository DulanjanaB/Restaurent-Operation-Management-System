export type TipPoolStatus = 'open' | 'calculated';

// numeric-typed backend columns (total_amount, percentage, amount) are
// transmitted as strings — DTOs use @IsNumberString, entities are
// `numeric` columns TypeORM returns as string. Keep them as string here.
export interface TipPool {
  id: string;
  branch_id: string;
  date: string;
  total_amount: string;
  status: TipPoolStatus;
  created_by: string;
  calculated_at: string | null;
  calculated_by: string | null;
}

// employee populated only on GET /tip/pools/:id's nested allocations;
// tip_pool populated only on the employee-centric allocation endpoints
// (/tip/my-allocations, /tip/employees/:id/allocations) — never both at
// once on the same call.
export interface TipAllocation {
  id: string;
  tip_pool_id: string;
  tip_pool?: TipPool;
  employee_id: string;
  employee?: { id: string; name: string; employee_code: string };
  percentage: string;
  amount: string | null;
  tip_payout_id: string | null;
}

export interface TipPayout {
  id: string;
  employee_id: string;
  amount: string;
  paid_at: string;
  paid_by: string;
  notes: string | null;
}

export interface TipBalance {
  employee_id: string;
  balance: string;
}
