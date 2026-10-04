'use client';

import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { switchBranch } from '@/lib/server/branch/actions';
import type { MyBranch } from '@/lib/server/branch/queries';

export function BranchSwitcher({
  branches,
  currentBranchId,
  hidden,
}: {
  branches: MyBranch[];
  currentBranchId: string;
  hidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (hidden || branches.length <= 1) return null;

  return (
    <Select
      value={currentBranchId}
      disabled={pending}
      onValueChange={(branchId) => {
        startTransition(() => {
          void switchBranch(branchId);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-48">
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
