import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getBarRecipe } from '@/lib/server/bar/queries';
import { getItems, getUnits } from '@/lib/server/inventory/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { EditRecipeForm } from './edit-recipe-form';
import { AddIngredientDialog } from './add-ingredient-dialog';
import { IngredientsList } from './ingredients-list';
import { DeleteRecipeButton } from './delete-recipe-button';
import { PageHeader } from '@/components/shared/page-header';
import { Money } from '@/components/shared/money';

export default async function BarRecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let recipe;
  try {
    recipe = await getBarRecipe(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [items, units] = await Promise.all([getItems(), getUnits()]);
  const canUpdate = hasPermission(me, 'bar.update');
  const canDelete = hasPermission(me, 'bar.delete');

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        tone="rose"
        title={<>{recipe.name}</>}
        description={
          <>
            Selling price <Money value={recipe.selling_price} />
          </>
        }
        action={
          canDelete ? (
            <DeleteRecipeButton recipeId={id} recipeName={recipe.name} />
          ) : undefined
        }
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Details</h2>
        {canUpdate ? (
          <EditRecipeForm recipe={recipe} />
        ) : (
          <p className="text-sm">
            Selling price: <Money value={recipe.selling_price} />
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Ingredients
          </h2>
          {canUpdate && (
            <AddIngredientDialog recipeId={id} items={items} units={units} />
          )}
        </div>
        <IngredientsList
          recipeId={id}
          ingredients={recipe.ingredients}
          canManage={canUpdate}
        />
      </section>
    </div>
  );
}
