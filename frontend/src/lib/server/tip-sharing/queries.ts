import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type { TipAllocation, TipBalance, TipPayout, TipPool } from './types';

export function getTipPools(branchId?: string): Promise<TipPool[]> {
  return apiFetch<TipPool[]>(
    `/tip/pools${branchId ? `?branch_id=${branchId}` : ''}`,
  );
}

export function getTipPool(
  id: string,
): Promise<TipPool & { allocations: TipAllocation[] }> {
  return apiFetch(`/tip/pools/${id}`);
}

export function getSuggestedParticipants(
  poolId: string,
): Promise<{ id: string; name: string; employee_code: string }[]> {
  return apiFetch(`/tip/pools/${poolId}/suggested-participants`);
}

export function getMyBalance(): Promise<TipBalance> {
  return apiFetch<TipBalance>('/tip/my-balance');
}

export function getMyAllocations(): Promise<TipAllocation[]> {
  return apiFetch<TipAllocation[]>('/tip/my-allocations');
}

export function getEmployeeBalance(employeeId: string): Promise<TipBalance> {
  return apiFetch<TipBalance>(`/tip/employees/${employeeId}/balance`);
}

export function getEmployeePayouts(employeeId: string): Promise<TipPayout[]> {
  return apiFetch<TipPayout[]>(`/tip/employees/${employeeId}/payouts`);
}
