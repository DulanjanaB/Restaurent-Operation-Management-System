import { getMe } from '@/lib/auth/dal';
import { getBarRecipes } from '@/lib/server/bar/queries';
import { hasPermission } from '@/lib/permissions';
import { RecipeCreateDialog } from './recipe-create-dialog';
import { RecipesTable } from './recipes-table';
import { PageHeader } from '@/components/shared/page-header';

export default async function BarRecipesPage() {
  const [me, recipes] = await Promise.all([getMe(), getBarRecipes()]);
  const canCreate = hasPermission(me, 'bar.create');

  return (
    <div className="space-y-4">
      <PageHeader
        tone="rose"
        title={<>Bar Recipes</>}
        description={<>Drinks and their ingredient pours.</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <RecipeCreateDialog />}
          </div>
        }
      />
      <RecipesTable recipes={recipes} />
    </div>
  );
}
