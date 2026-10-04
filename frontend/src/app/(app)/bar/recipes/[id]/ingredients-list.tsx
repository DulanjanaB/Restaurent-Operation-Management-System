'use client';

import { DeleteButton } from '@/components/shared/delete-button';
import { EmptyState } from '@/components/shared/empty-state';
import { removeRecipeIngredient } from '@/lib/server/bar/actions';
import type { BarRecipeIngredient } from '@/lib/server/bar/types';

export function IngredientsList({
  recipeId,
  ingredients,
  canManage,
}: {
  recipeId: string;
  ingredients: BarRecipeIngredient[];
  canManage: boolean;
}) {
  if (ingredients.length === 0) {
    return <EmptyState title="No ingredients yet" />;
  }

  return (
    <ul className="divide-y rounded-md border">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div>
            <p className="font-medium">{ingredient.item?.name}</p>
            <p className="text-sm text-muted-foreground">
              {ingredient.quantity_per_serving} {ingredient.unit?.abbreviation}{' '}
              per serving
            </p>
          </div>
          {canManage && (
            <DeleteButton
              itemLabel={`${ingredient.item?.name} from this recipe`}
              onDelete={() => removeRecipeIngredient(recipeId, ingredient.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
