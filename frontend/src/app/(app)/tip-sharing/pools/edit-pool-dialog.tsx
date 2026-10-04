'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditAmountForm } from './[id]/edit-amount-form';

export function EditPoolDialog({
  poolId,
  date,
  totalAmount,
}: {
  poolId: string;
  date: string;
  totalAmount: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit total for {date}</DialogTitle>
          <DialogDescription>
            Only open pools can be changed. Calculate the pool after saving.
          </DialogDescription>
        </DialogHeader>
        <EditAmountForm poolId={poolId} totalAmount={totalAmount} />
      </DialogContent>
    </Dialog>
  );
}
