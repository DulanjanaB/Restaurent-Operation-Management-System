'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PoCreateForm } from './po-create-form';
import type { Item, Supplier } from '@/lib/server/inventory/types';

export function PoCreateDialog({
  branchId,
  items,
  suppliers,
}: {
  branchId: string;
  items: Item[];
  suppliers: Supplier[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Purchase Order</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
        </DialogHeader>
        <PoCreateForm branchId={branchId} items={items} suppliers={suppliers} />
      </DialogContent>
    </Dialog>
  );
}
