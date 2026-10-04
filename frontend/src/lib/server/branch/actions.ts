'use server';

import { revalidatePath } from 'next/cache';
import { setBranchCookie } from '@/lib/auth/session';

export async function switchBranch(branchId: string) {
  await setBranchCookie(branchId);
  revalidatePath('/', 'layout');
}
