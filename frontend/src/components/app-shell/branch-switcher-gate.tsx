'use client';

import { usePathname } from 'next/navigation';
import { BranchSwitcher } from './branch-switcher';
import type { MyBranch } from '@/lib/server/branch/queries';

// Branch-agnostic modules (Administration, Settings) hide the switcher —
// their data isn't scoped to a branch, so switching there would be
// misleading. Read client-side so it follows client-side navigation.
const BRANCH_AGNOSTIC_PREFIXES = ['/administration', '/settings'];

export function BranchSwitcherGate({
  branches,
  currentBranchId,
}: {
  branches: MyBranch[];
  currentBranchId: string;
}) {
  const pathname = usePathname();
  const hidden = BRANCH_AGNOSTIC_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  return (
    <BranchSwitcher
      branches={branches}
      currentBranchId={currentBranchId}
      hidden={hidden}
    />
  );
}
