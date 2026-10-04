'use client';

import { useState, useTransition } from 'react';
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
import { addRecipeIngredient } from '@/lib/server/bar/actions';
import type { Item, Unit } from '@/lib/server/inventory/types';

export function AddIngredientDialog({
  recipeId,
  items,
  units,
}: {
  recipeId: string;
  items: Item[];
  units: Unit[];
}) {
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const selectedItem = items.find((item) => item.id === itemId);
  // The backend does NOT validate this — if base_unit_quantity is missing
  // and the chosen unit differs from the item's own stock unit, it
  // silently assumes a 1:1 conversion (see docs/bar-management-design.md
  // and the verified backend behavior). Warn here since nothing else will.
  const needsConversionWarning =
    selectedItem &&
    !selectedItem.base_unit_quantity &&
    unitId &&
    unitId !== selectedItem.unit_id;

  function submit() {
    if (!itemId || !quantity || !unitId) {
      setError('Fill in every field.');
      return;
    }
    startTransition(async () => {
      const result = await addRecipeIngredient(
        recipeId,
        itemId,
        quantity,
        unitId,
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setItemId('');
        setUnitId('');
        setQuantity('');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add ingredient</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an ingredient</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Item</FieldLabel>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Quantity per serving</FieldLabel>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Unit</FieldLabel>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {needsConversionWarning && (
            <p className="text-sm text-amber-600">
              This item has no base unit quantity set, and this unit differs
              from its stock unit. The system will silently assume a 1:1
              conversion when deducting stock — set the item&apos;s base unit
              quantity first (e.g. 750 for a 750ml bottle) to avoid
              over/under-deducting.
            </p>
          )}
          {error && <FieldError>{error}</FieldError>}
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Adding…' : 'Add'}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
