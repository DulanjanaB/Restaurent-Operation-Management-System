'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { recordSale } from '@/lib/server/bar/actions';
import type { BarRecipe } from '@/lib/server/bar/types';
import { Money } from '@/components/shared/money';

// Deliberately minimal and fast — this is a high-frequency action (per
// docs/bar-management-design.md), not a general CRUD form. Big recipe
// buttons, one tap to record a single serving, optimistic feedback.
export function SaleEntry({
  warehouseId,
  recipes,
}: {
  warehouseId: string;
  recipes: BarRecipe[];
}) {
  const [recentCount, setRecentCount] = useOptimistic(0, (count) => count + 1);
  const [, startTransition] = useTransition();
  const [quantity, setQuantity] = useState('1');

  function sell(recipe: BarRecipe) {
    startTransition(async () => {
      setRecentCount(1);
      const result = await recordSale(warehouseId, recipe.id, quantity || '1');
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Sold ${quantity}× ${recipe.name}`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="qty" className="text-sm text-muted-foreground">
          Servings
        </label>
        <Input
          id="qty"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-20"
        />
        {recentCount > 0 && (
          <span className="text-xs text-muted-foreground">
            Last sale just recorded
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="hover:bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center gap-1 py-6">
              <Button
                variant="ghost"
                className="h-auto w-full flex-col gap-1 whitespace-normal p-0"
                onClick={() => sell(recipe)}
              >
                <span className="font-medium">{recipe.name}</span>
                <span className="text-sm text-muted-foreground">
                  <Money value={recipe.selling_price} />
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
