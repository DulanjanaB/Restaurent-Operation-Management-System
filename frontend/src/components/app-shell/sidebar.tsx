import { NavLinks } from './nav-links';
import { Brand, type Brand as BrandValue } from './brand';
import type { Me } from '@/lib/auth/dal';

export function Sidebar({ me, brand }: { me: Me; brand: BrandValue }) {
  return (
    <aside className="no-print hidden w-56 shrink-0 border-r bg-muted/20 md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Brand brand={brand} />
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <NavLinks me={me} />
      </nav>
    </aside>
  );
}
