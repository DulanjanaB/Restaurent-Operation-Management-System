'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteBarRecipe } from '@/lib/server/bar/actions';

export function DeleteRecipeButton({
  recipeId,
  recipeName,
}: {
  recipeId: string;
  recipeName: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="outline">
          Delete recipe
        </Button>
      }
      title={`Delete ${recipeName}?`}
      description="Recipes with recorded sales can't be deleted — the server will reject it if so."
      variant="destructive"
      confirmLabel="Delete"
      onConfirm={async () => {
        const result = await deleteBarRecipe(recipeId);
        if (result.error) return result;
        toast.success('Recipe deleted.');
        router.push('/bar/recipes');
      }}
    />
  );
}
