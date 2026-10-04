import 'server-only';
import { apiFetch } from '@/lib/api/client';

export interface MyBranch {
  id: string;
  name: string;
  code: string;
}

export interface MyBranchesResponse {
  allBranches: boolean;
  branches: MyBranch[];
}

export function getMyBranches(): Promise<MyBranchesResponse> {
  return apiFetch<MyBranchesResponse>('/auth/my-branches');
}
