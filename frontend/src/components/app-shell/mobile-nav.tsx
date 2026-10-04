'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavLinks } from './nav-links';
import { Brand, type Brand as BrandValue } from './brand';
import type { Me } from '@/lib/auth/dal';

// Below the `md` breakpoint the Sidebar is hidden entirely — this is the
// only way to reach any module's navigation on a phone-width viewport.
export function MobileNav({ me, brand }: { me: Me; brand: BrandValue }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="no-print md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="h-14 justify-center border-b px-4">
          <SheetTitle asChild>
            <div>
              <Brand brand={brand} />
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          <NavLinks me={me} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
