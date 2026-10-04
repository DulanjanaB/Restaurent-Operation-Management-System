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
import { TransferCreateForm } from './transfer-create-form';
import type { Item, Warehouse } from '@/lib/server/inventory/types';

export function TransferCreateDialog({
  items,
  warehouses,
}: {
  items: Item[];
  warehouses: Warehouse[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Transfer</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New stock transfer</DialogTitle>
        </DialogHeader>
        <TransferCreateForm items={items} warehouses={warehouses} />
      </DialogContent>
    </Dialog>
  );
}
