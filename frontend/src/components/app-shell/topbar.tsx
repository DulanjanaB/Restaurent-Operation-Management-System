import { getMyBranches } from '@/lib/server/branch/queries';
import { BranchSwitcherGate } from './branch-switcher-gate';
import { MobileNav } from './mobile-nav';
import type { Brand as BrandValue } from './brand';
import { UserMenu } from './user-menu';
import type { Me } from '@/lib/auth/dal';

export async function Topbar({ me, brand }: { me: Me; brand: BrandValue }) {
  const { branches } = await getMyBranches();

  return (
    <header className="no-print flex h-14 items-center justify-between border-b px-4">
      <MobileNav me={me} brand={brand} />
      <div className="flex items-center gap-3">
        <BranchSwitcherGate
          branches={branches}
          currentBranchId={me.current_branch_id}
        />
        <UserMenu me={me} />
      </div>
    </header>
  );
}
