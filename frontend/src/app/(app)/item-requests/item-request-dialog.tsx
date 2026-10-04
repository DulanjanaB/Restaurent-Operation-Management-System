'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { createItemRequest } from '@/lib/server/inventory/actions';
import type { ActionResult } from '@/lib/validation';
import type { ItemRequestCatalog } from '@/lib/server/inventory/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

type Line = { key: number; item_id: string; quantity: string };

const initialState: ActionResult = {};

function blankLines(): Line[] {
  return [{ key: 1, item_id: '', quantity: '' }];
}

export function ItemRequestDialog({
  catalog,
}: {
  catalog: ItemRequestCatalog;
}) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(blankLines);
  const [nextKey, setNextKey] = useState(2);
  const [state, formAction, pending] = useActionState(
    createItemRequest,
    initialState,
  );
  useCloseDialogOnSuccess(pending, state, setOpen);

  const validLines = lines.filter(
    (line) => line.item_id && Number(line.quantity) > 0,
  );

  function handleOpenChange(next: boolean) {
    if (next) {
      setLines(blankLines());
      setNextKey(2);
    }
    setOpen(next);
  }

  function updateLine(key: number, patch: Partial<Omit<Line, 'key'>>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function removeLine(key: number) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { key: nextKey, item_id: '', quantity: '' },
    ]);
    setNextKey((key) => key + 1);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>New request</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New item request</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="warehouse_id">Store</FieldLabel>
              <Select
                name="warehouse_id"
                defaultValue={catalog.warehouses[0]?.id}
                required
              >
                <SelectTrigger id="warehouse_id">
                  <SelectValue placeholder="Choose a store" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-2">
              <p className="text-sm font-medium">Items</p>
              {lines.map((line) => (
                <div key={line.key} className="flex items-center gap-2">
                  <Select
                    value={line.item_id}
                    onValueChange={(value) =>
                      updateLine(line.key, { item_id: value })
                    }
                  >
                    <SelectTrigger className="flex-1" aria-label="Item">
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.unit.abbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Qty"
                    aria-label="Quantity"
                    className="w-24"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.key, { quantity: event.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(line.key)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </div>

            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Input
                id="notes"
                name="notes"
                maxLength={500}
                placeholder="e.g. needed before lunch service"
              />
            </Field>

            <input
              type="hidden"
              name="lines"
              value={JSON.stringify(
                validLines.map(({ item_id, quantity }) => ({
                  item_id,
                  quantity,
                })),
              )}
            />

            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending || validLines.length === 0}>
              {pending ? 'Submitting…' : 'Submit request'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
